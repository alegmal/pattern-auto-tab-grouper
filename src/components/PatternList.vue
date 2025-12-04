<template>
  <div class="pattern-list">
    <div
      v-for="(matcher, index) in localMatchers"
      :key="matcher.id"
      class="pattern-list-new"
    >
      <mwc-icon-button
        class="delete-pattern-button"
        icon="delete"
        @click="deletePattern(index)"
        :title="'Delete pattern'"
      />
      <Textfield
        :ref="(component: any) => {
            if (component === null) {
              delete matcherRefs[matcher.id]
            } else {
              matcherRefs[matcher.id] = {component, index}
            }
          }"
        :modelValue="matcher.value"
        @update:modelValue="matcher.value = $event"
        :pattern="matcherPattern"
        :placeholder="msg.urlInputPlaceholder"
        @change="updateMatchers"
        @keydown.backspace="
          matcher.value.length === 0 && backspaceFromMatcherInput(index)
        "
        @keydown.enter="returnFromMatcherInput(index)"
        @keydown.escape="triggerBlur"
        :validation-message="msg.invalidUrlPattern"
      />
      <!--
          The production build partly eradicates the info icon when used as a
          regular component, therefore we inject it as innerHTML.
          -->
      <a
        tabindex="-1"
        class="pattern-list-info"
        href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
        target="_blank"
        rel="noopener"
        :title="msg.matchPatternInfo"
        v-html="
          `<mwc-icon-button tabindex='-1' icon='info_outline'></mwc-icon-button>`
        "
      />
    </div>
    <!-- Always show the new matcher input -->
    <div
      class="pattern-list-new"
      ref="newMatcherContainer"
      @focusout="handleBlur"
    >
      <mwc-icon-button
        class="delete-pattern-button invisible"
        icon="delete"
        disabled
        :title="''"
      />
      <Textfield
        ref="newMatcher"
        v-model="newMatcherValue"
        :pattern="matcherPattern"
        :placeholder="msg.urlInputPlaceholder"
        @change="handleNewMatcher"
        @keydown.backspace="
          newMatcherValue.length === 0 && backspaceFromMatcherInput(-1)
        "
        @keydown.enter="returnFromMatcherInput(-1)"
        @keydown.escape="triggerBlur"
        :validation-message="msg.invalidUrlPattern"
        auto-validate
      />

      <!--
        The production build partly eradicates the info icon when used as a
        regular component, therefore we inject it as innerHTML.
        -->
      <a
        tabindex="-1"
        class="pattern-list-info"
        href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
        target="_blank"
        rel="noopener"
        :title="msg.matchPatternInfo"
        v-html="
          `<mwc-icon-button tabindex='-1' icon='info_outline'></mwc-icon-button>`
        "
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Textfield from './Form/Textfield.vue'

import { useSyncedCopy } from '@/composables'
import { matcherPattern } from '@/util/helpers'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  keepOne?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', options: string[]): void
}>()

const matcherRefs = ref<Record<string, { component: any; index: number }>>({})
const sortedMatcherRefs = computed(() =>
  Object.values(matcherRefs.value)
    .sort((a, b) => a.index - b.index)
    .map(({ component }) => component)
)

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy(() => {
  const items = props.modelValue.map(matcher => ({
    id: crypto.randomUUID(),
    value: matcher
  }))

  if (items.length === 0 && props.keepOne) {
    items.push({ id: crypto.randomUUID(), value: '' })
  }

  return items
})

defineExpose({
  focus(index: number) {
    matcherRefs.value[localMatchers.value[index].id].component.focus()
  }
})

const newMatcherValue = ref('')
const newMatcher = ref()

const isEmpty = (value: string) => value.trim().length === 0
const isEmptyMatcher = (matcher: { value: string }) => isEmpty(matcher.value)
const not =
  <T extends (...args: any[]) => boolean>(fn: T) =>
  (...args: Parameters<T>) =>
    !fn(...args)

function getNonEmptyMatchers() {
  let matchers = localMatchers.value

  if (matchers.some(isEmptyMatcher)) {
    matchers = matchers.filter(not(isEmptyMatcher))
  }

  return matchers.map(({ value }) => value)
}

function returnFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    if (matcherIndex === -1) {
      // Already in new matcher input, stay focused
      newMatcher.value.focus()
    } else if (matcherIndex < sortedMatcherRefs.value.length - 1) {
      sortedMatcherRefs.value[matcherIndex + 1]?.focus()
    } else {
      // Last pattern - focus new matcher input
      newMatcher.value.focus()
    }
  }, 0)
}

function backspaceFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    if (matcherIndex === -1) {
      if (sortedMatcherRefs.value.length > 0) {
        sortedMatcherRefs.value[sortedMatcherRefs.value.length - 1].focus()
      } else {
        newMatcher.value.blur()
      }
    } else if (matcherIndex > 0) {
      sortedMatcherRefs.value[matcherIndex].blur()

      // As the list re-renders after blurring, we need to
      // wait a moment before focusing one of its elements
      setTimeout(() => {
        sortedMatcherRefs.value[matcherIndex - 1].focus()
      }, 0)
    } else {
      sortedMatcherRefs.value[matcherIndex].blur()
    }
  }, 0)
}

function handleNewMatcher() {
  const validMatchers = getNonEmptyMatchers()

  if (
    !isEmpty(newMatcherValue.value) &&
    newMatcher.value?.isValid() &&
    !validMatchers.includes(newMatcherValue.value)
  ) {
    emit('update:modelValue', [...validMatchers, newMatcherValue.value])

    newMatcherValue.value = ''
  }
}

function triggerBlur(event: KeyboardEvent) {
  ;(event.target as HTMLElement).blur()
}

const newMatcherContainer = ref<HTMLElement>()
function handleBlur() {
  // Input is always visible, no need to hide it
  // Just let the blur happen naturally
}

function deletePattern(index: number) {
  localMatchers.value.splice(index, 1)
  updateMatchers()
}

function updateMatchers() {
  emit('update:modelValue', getNonEmptyMatchers())
}
</script>

<style lang="scss" scoped>
.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-list-new {
  display: flex;
  align-items: center;
  position: relative;
  gap: 4px;
}

.delete-pattern-button {
  flex-shrink: 0;
  --mdc-icon-size: 20px;
  color: var(--dimmed);
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;

  &:hover {
    opacity: 1;
    color: var(--mdc-theme-error);
  }

  &.invisible {
    visibility: hidden;
    pointer-events: none;
  }
}

.pattern-list-info {
  display: none;
  position: absolute;
  top: -0.25rem;
  right: 0;

  color: var(--grey);
}

.pattern-list-new:focus-within .pattern-list-info {
  display: block;
}
</style>
