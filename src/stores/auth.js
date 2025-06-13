import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {STORAGE_KEYS} from '../api/config.js'

/**
 * 用户认证状态管理 Store
 * 负责管理用户登录状态、用户信息和认证相关的操作
 */
export const useAuthStore = defineStore('auth', () => {
    // 响应式状态
    // 在页面刷新时从本地存储恢复用户信息
    const user = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH.USER)) || null);
    const isLoading = ref(false) // 认证操作加载状态

    // 计算属性：用户是否已认证
    const isAuthenticated = computed(() => {
        /*
        !! 是 JavaScript 的双重否定操作符，它的作用是将任何值转换为布尔值
            如果 user.value 是 null、undefined、0、""、false 等假值 → 返回 false
            如果 user.value 是对象、非空字符串、非零数字等真值 → 返回 true
        !! 等价于使用 Boolean() 构造函数, 这两种写法是等价的
            !!user.value === Boolean(user.value)
         */
        return !!user.value && !!localStorage.getItem(STORAGE_KEYS.AUTH.TOKEN)
    })

    // 计算属性：获取用户显示名称
    const userDisplayName = computed(() => {
        return user.value?.username || '用户'
    })

    /**
     * 设置用户信息和认证状态
     * @param {Object} userData - 用户数据对象
     * @param {string} userData.accessToken - 认证令牌
     * @param {string} userData.tokenType - 令牌类型
     * @param {number} userData.expiresIn - 令牌过期时间
     * @param {Object} userData.userInfo - 用户信息对象
     * @param {string} userData.userInfo.id - 用户ID
     * @param {string} userData.userInfo.username - 用户名
     * @param {string} userData.userInfo.email - 用户邮箱
     */
    function setUser(userData) {
        try {
            const token = userData.accessToken;
            const userInfo = userData.userInfo;

            // 构建用户对象
            user.value = {
                id: userInfo.id,
                username: userInfo.username,
                email: userInfo.email,
                expiresIn: userData.expiresIn
            }

            // 存储认证令牌到本地存储
            localStorage.setItem(STORAGE_KEYS.AUTH.TOKEN, token)

            // 存储用户信息到本地存储
            localStorage.setItem(STORAGE_KEYS.AUTH.USER, JSON.stringify(user.value))
        } catch (err) {
            console.error('设置用户信息失败:', err)
        }
    }

    /**
     * 用户登出操作
     * 清除所有认证相关的本地存储和状态
     */
    function logout() {
        user.value = null
        // 清除本地存储中的认证信息
        localStorage.removeItem(STORAGE_KEYS.AUTH.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.AUTH.USER)
    }

    /**
     * 从本地存储恢复用户状态
     * 用于页面刷新后恢复登录状态
     */
    function restoreUserFromStorage() {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH.TOKEN)
            const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH.USER)

            if (token && storedUser) {
                /*
                `{...userData, token}` 是 JavaScript 的对象展开（Object Spread）语法。
                    - `...userData`：将 `userData` 对象中的所有属性“展开”到新对象中。
                    - `token`：等价于 `token: token`，为新对象添加一个名为 `token` 的属性，值为变量 `token`。
                综合起来，这段代码会创建一个新对象，包含 `userData` 的所有属性，并额外添加或覆盖 `token` 属性。例如：
                    const userData = { id: 1, username: 'Tom' }
                    const token = 'abc123'
                    const result = { ...userData, token }
                    结果：{ id: 1, username: 'Tom', token: 'abc123' }
                如果 `userData` 里本身有 `token` 属性，后面的 `token` 会覆盖它。这种写法常用于合并对象或在原有对象基础上添加/修改属性。
                 */
                // user.value = {...userData, token}

                user.value = JSON.parse(storedUser)
            }
        } catch (err) {
            console.error('从本地存储恢复用户状态失败:', err)
            // 如果恢复失败，清除可能损坏的数据
            logout()
        }
    }

    /**
     * 设置加载状态
     * @param {boolean} loading - 加载状态
     */
    function setLoading(loading) {
        isLoading.value = loading
    }

    return {
        // 状态
        user,
        isLoading,

        // 计算属性
        isAuthenticated,
        userDisplayName,

        // 方法
        setUser,
        logout,
        restoreUserFromStorage,
        setLoading
    }

})
