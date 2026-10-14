<template>
  <el-input
    v-model="model"
    type="password"
    show-password
    autocomplete="new-password"
    :placeholder="masked ? maskedPlaceholder : placeholder"
  />
</template>

<script setup lang="ts">
/**
 * 密钥输入。编辑已有记录时传 `masked`：输入框为空表示不修改原值，提交方据此省略该字段。
 *
 * @example
 * <SecretInput v-model="form.apiKey" :masked="isEdit" masked-placeholder="留空表示不修改" />
 */
withDefaults(defineProps<{ masked?: boolean; placeholder?: string; maskedPlaceholder?: string }>(), {
  masked: false,
  placeholder: '',
  maskedPlaceholder: '••••••••',
});

const model = defineModel<string>({ default: '' });
</script>
