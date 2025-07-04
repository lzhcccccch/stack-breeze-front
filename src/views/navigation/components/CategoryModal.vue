<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? '编辑分类' : '添加新分类' }}</h3>
        <button @click="handleClose" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="categoryName">分类名称</label>
          <input
            type="text"
            id="categoryName"
            v-model="formData.categoryName"
            placeholder="请输入分类名称"
            maxlength="20"
            @keyup.enter="handleSubmit"
          />
        </div>
        <div class="form-group">
          <label for="categoryIcon">分类图标</label>
          <input
            type="text"
            id="categoryIcon"
            v-model="formData.icon"
            placeholder="请输入图标（如：📁）"
            maxlength="2"
          />
        </div>
        <div class="form-group">
          <label for="categorySort">分类排序</label>
          <input
            type="number"
            id="categorySort"
            v-model.number="formData.categorySort"
            placeholder="请输入排序号"
            min="1"
            :max="maxSortValue"
          />
          <div class="form-help">
            {{ isEditing ? '修改排序号可调整分类显示顺序' : `默认排序号：${defaultSortValue}` }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleClose" class="btn btn-secondary">取消</button>
        <button
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="!isFormValid || loading"
        >
          {{ loading ? '保存中...' : (isEditing ? '更新' : '添加') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit'])

// 表单数据
const formData = ref({
  categoryName: '',
  icon: '📁',
  categorySort: 1
})

// 计算属性
const isEditing = computed(() => !!props.category)
const isFormValid = computed(() => formData.value.categoryName.length > 0)

// 计算默认排序值和最大排序值
const defaultSortValue = computed(() => {
  const realCategories = props.categories.filter(cat => cat?.id !== 'all')
  return realCategories.length + 1
})

const maxSortValue = computed(() => {
  const realCategories = props.categories.filter(cat => cat?.id !== 'all')
  return Math.max(realCategories.length + 1, 1)
})

// 监听分类数据变化
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formData.value = {
      categoryName: newCategory.categoryName || '',
      icon: newCategory.icon || '📁',
      categorySort: newCategory.categorySort || defaultSortValue.value
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听分类列表变化，更新默认排序值
watch(() => props.categories, () => {
  if (!isEditing.value) {
    formData.value.categorySort = defaultSortValue.value
  }
}, { deep: true })

// 监听显示状态
watch(() => props.show, (show) => {
  if (!show) {
    resetForm()
  }
})

// 方法
function resetForm() {
  formData.value = {
    categoryName: '',
    icon: '📁',
    categorySort: defaultSortValue.value
  }
}

function handleClose() {
  emit('close')
}

function handleOverlayClick() {
  emit('close')
}

function handleSubmit() {
  if (!isFormValid.value || props.loading) return

  emit('submit', {
    ...formData.value,
    categoryName: formData.value.categoryName,
  })
}
</script>

<style scoped>
/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-base);
}

.modal {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-base);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: var(--transition-base);
  background: var(--color-bg-primary);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-base);
  justify-content: flex-end;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: var(--transition-base);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-medium);
}

.btn-secondary:hover {
  background: var(--color-gray-200);
  color: var(--color-text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal {
    margin: var(--spacing-base);
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
