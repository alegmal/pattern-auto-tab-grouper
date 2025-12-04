<script lang="ts" setup>
import Layout from './Layout.vue'
import PopupSuggestion from './components/Popup/Suggestion.vue'
import PopupGroupSelection from './components/Popup/GroupSelection.vue'
import PopupAdditionalActions from './components/Popup/AdditionalActions.vue'
import EditDialog from './components/Dialog/EditDialog.vue'
import SlideVertical from './components/Util/SlideVertical.vue'
import SettingsDialog from './components/Dialog/SettingsDialog.vue'
import Group from './components/Group.vue'
import Draggable from 'vuedraggable'

import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useGroupConfigurations, useStorage, useSyncedCopy } from '@/composables'
import { saveGroupConfigurations } from '@/util/group-configurations'
import { SaveOptions, GroupConfiguration } from '@/util/types'
import { isExtensionWorker, matcherPattern } from '@/util/helpers'

const popupSuggestionRef = ref<InstanceType<typeof PopupSuggestion>>()

const groups = useGroupConfigurations()

const showAddDialog = ref(false)
function openAddDialog() {
  showAddDialog.value = true
}
function closeAddDialog() {
  showAddDialog.value = false
}
function cancelAddDialog() {
  selectedGroup.value = ''
}
async function saveAddDialog(
  title: string,
  color: chrome.tabGroups.ColorEnum,
  options: SaveOptions
) {
  const id = crypto.randomUUID()

  await saveGroupConfigurations([
    ...groups.data.value,
    {
      id,
      title,
      color,
      matchers: [],
      options
    }
  ])

  selectedGroup.value = id
}

const selectedGroup = ref('')
const patterns = ref<string[]>([])

const matcherRegex = new RegExp(matcherPattern)

const hasValidMatchers = computed(() => {
  if (patterns.value.length === 0) return false
  if (!patterns.value.every(value => matcherRegex.test(value))) return false

  if (selectedGroup.value === '') return false

  return true
})

const snackbarRef = ref()

const errorMessage = ref('')

watch(hasValidMatchers, value => {
  if (value) {
    errorMessage.value = ''
  }
})

function savePatterns() {
  if (!hasValidMatchers.value) {
    errorMessage.value =
      'Please enter at least one URL pattern and select a group.'
    return
  }

  groups.data.value = groups.data.value.map(group => {
    if (group.id === selectedGroup.value) {
      return {
        ...group,
        matchers: [...new Set([...group.matchers, ...patterns.value])]
      }
    } else {
      return group
    }
  })

  selectedGroup.value = ''
  patterns.value = []

  snackbarRef.value.show()
}

function addLink() {
  // if (patterns.value.length === 0) {
  //   popupSuggestionRef.value?.focus(0)
  // } else {
  //   popupSuggestionRef.value?.showNewMatcher()
  // }
  popupSuggestionRef.value?.showNewMatcher()
}

// Toggle for showing all rules inline
const showAllRules = ref(false)

function openOptions() {
  showAllRules.value = true
}

// Options view state and functions (copied from Options.vue)
const groupRefs: Record<string, typeof Group> = {}
const groupsCopy = useSyncedCopy(groups.data, () => {
  saveGroupConfigurations(groupsCopy.value)
})

const undoStack: Array<() => void> = []
function undo() {
  if (undoStack.length > 0) {
    const undoAction = undoStack.pop()
    undoAction!()
  }
}

const showOptionsAddDialog = ref(false)
const optionsAddButton = ref()
function openOptionsAddDialog() {
  showOptionsAddDialog.value = true
}
function closeOptionsAddDialog() {
  showOptionsAddDialog.value = false
  optionsAddButton.value?.focus()
}

const showSettingsDialog = ref(false)
const settingsButton = ref()
function openSettingsDialog() {
  showSettingsDialog.value = true
}
function closeSettingsDialog() {
  showSettingsDialog.value = false
  settingsButton.value?.focus()
}

const dragging = ref(false)
function startDragging(event: any) {
  event.item.classList.add('no-matchers')
  dragging.value = true
}

function scrollGroupIntoView(id: string) {
  document.getElementById(`group-${id}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function deleteGroup(group: GroupConfiguration) {
  const index = groupsCopy.value.findIndex(
    searchedGroup => searchedGroup.id === group.id
  )

  undoStack.push(() => {
    groupsCopy.value.splice(index, 0, group)
    nextTick(() => {
      scrollGroupIntoView(group.id)
    })
  })
  groupsCopy.value.splice(index, 1)

  optionsSnackbar.value?.show()
}

function addGroupFromOptions(
  title: string,
  color: chrome.tabGroups.ColorEnum,
  { strict, merge }: SaveOptions
) {
  const id = crypto.randomUUID()

  groupsCopy.value.push({
    id,
    title: title,
    color: color,
    matchers: [],
    options: {
      strict,
      merge
    }
  })

  nextTick(() => {
    groupRefs[id]?.showNewMatcher()
    setTimeout(() => {
      scrollGroupIntoView(id)
    }, 0)
  })
}

const optionsSnackbar = ref()

function editGroup(id: string) {
  scrollToGroup.data.value = id
  openOptions()
}

async function createFromCurrentGroup(
  title: string,
  color: chrome.tabGroups.ColorEnum,
  tabs: chrome.tabs.Tab[]
) {
  const id = crypto.randomUUID()
  scrollToGroup.data.value = id

  await saveGroupConfigurations([
    ...groups.data.value,
    {
      id,
      title,
      color,
      matchers: [],
      options: { strict: false, merge: false }
    }
  ])

  patterns.value = tabs.map(tab => tab.url!)
  selectedGroup.value = id
}

const scrollToGroup = useStorage('scrollToGroup', '' as string, {
  storage: 'local'
})

onMounted(() => {
  setTimeout(() => {
    if (document.body.scrollWidth > document.body.clientWidth) {
      document.documentElement.style.setProperty(
        '--popup-width',
        `${document.body.clientWidth - 2 * 15}px`
      )
    }
  }, 0)
})
</script>

<template>
  <Layout>
    <Suspense>
      <!-- Quick add view -->
      <div v-if="!showAllRules" class="popup">
        <h1 class="h6">{{ msg.popupHeadline }}</h1>
        <PopupSuggestion ref="popupSuggestionRef" v-model="patterns" />
        <SlideVertical :duration="0.3">
          <mwc-button
            v-if="patterns.length > 0"
            class="button-add-pattern"
            icon="add_link"
            dense
            @click="addLink"
            v-text="msg.popupAddLink"
          />
        </SlideVertical>

        <PopupGroupSelection
          class="popup-group-selection"
          :model-value="selectedGroup"
          @update:model-value="selectedGroup = $event"
          @new="openAddDialog"
        />
        <div class="button-row">
          <mwc-button
            class="button-save"
            unelevated
            v-text="msg.popupSaveButton"
            @click="savePatterns"
          />
          <mwc-button
            class="button-show-all"
            unelevated
            icon="list"
            @click="openOptions"
          >
            Show all Rules
          </mwc-button>
        </div>

        <SlideVertical :duration="0.3">
          <p class="error-message" v-if="errorMessage" v-text="errorMessage" />
        </SlideVertical>

        <hr />

        <div class="more-options">
          <mwc-button icon="settings" @click="openOptions">
            {{ msg.popupMoreOptions }}
          </mwc-button>

          <PopupAdditionalActions
            v-if="isExtensionWorker"
            @create-group="createFromCurrentGroup"
            @edit-group="editGroup"
          />
        </div>
      </div>

      <!-- Expanded options view -->
      <div v-else class="popup-expanded">
        <div class="back-button-row">
          <mwc-icon-button
            icon="arrow_back"
            @click="showAllRules = false"
            :title="'Back to quick add'"
          />
          <h1 class="h6">All Grouping Rules</h1>
        </div>

        <div class="settings">
          <div class="groups">
            <img
              v-if="groupsCopy.length === 0"
              src="/arrow.svg"
              class="initial-arrow"
              draggable="false"
            />

            <template v-else>
              <Draggable
                v-model="groupsCopy"
                item-key="id"
                handle=".drag-handle"
                drag-class="dragging"
                @start="startDragging"
                @end="dragging = false"
              >
                <template #item="{ element: group }">
                  <Group
                    :ref="(component: any) => {
                      if (component === null) {
                        delete groupRefs[group.id]
                      } else {
                        groupRefs[group.id] = component
                      }
                    }"
                    :id="`group-${group.id}`"
                    :group-id="group.id"
                    v-model:title="group.title"
                    v-model:color="group.color"
                    v-model:options="group.options"
                    v-model:matchers="group.matchers"
                    @delete="deleteGroup(group)"
                  />
                </template>
              </Draggable>
            </template>
          </div>

          <div class="bottom-buttons">
            <mwc-fab
              ref="settingsButton"
              class="secondary-button settings-button"
              icon="settings"
              @click="openSettingsDialog"
              mini
              :title="msg.buttonSettings"
            />

            <mwc-fab
              ref="optionsAddButton"
              icon="add"
              @click="openOptionsAddDialog"
              mini
              :title="msg.buttonAddGroup"
            />
          </div>

          <transition name="from-right">
            <EditDialog
              v-if="showOptionsAddDialog"
              color="grey"
              @save="addGroupFromOptions"
              @close="closeOptionsAddDialog"
            />
          </transition>

          <transition name="from-right">
            <SettingsDialog
              v-if="showSettingsDialog"
              color="grey"
              @close="closeSettingsDialog"
            />
          </transition>

          <mwc-snackbar :labelText="msg.groupDeletedNotice" ref="optionsSnackbar">
            <mwc-button slot="action" @click="undo">{{ msg.undo }}</mwc-button>
            <mwc-icon-button icon="close" slot="dismiss" />
          </mwc-snackbar>
        </div>
      </div>
    </Suspense>

    <transition name="from-right">
      <EditDialog
        v-if="showAddDialog"
        color="grey"
        @cancel="cancelAddDialog"
        @save="saveAddDialog"
        @close="closeAddDialog"
      />
    </transition>

    <mwc-snackbar :labelText="msg.popupSavedMessage" ref="snackbarRef">
      <mwc-icon-button icon="close" slot="dismiss" />
    </mwc-snackbar>
  </Layout>
</template>

<style lang="scss" scoped>
.popup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: var(--popup-width, 600px);
}

.popup-group-selection {
  margin: 0.75rem 0;
}

.button-add-pattern {
  align-self: flex-start;
}

.button-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.button-save {
  flex: 0 0 auto;
}

.button-show-all {
  flex: 0 0 auto;
}

.more-options {
  display: flex;
  gap: 0.5rem;
}

/* Expanded options view styles */
.popup-expanded {
  min-width: 800px;
  max-height: 600px;
  overflow-y: auto;
}

.back-button-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Styles copied from Options.vue */
.settings {
  padding-bottom: 60px;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.bottom-buttons {
  display: flex;
  gap: 4px;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
}

.initial-arrow {
  position: fixed;
  right: 60px;
  bottom: 67px;
  width: 80px;
  height: auto;
}

.secondary-button {
  --mdc-fab-box-shadow: 0 3px 5px -1px rgb(0 0 0 / 12%),
    0 6px 10px 0 rgb(0 0 0 / 6%), 0 1px 18px 0 rgb(0 0 0 / 4%);
  --mdc-theme-on-secondary: var(--dimmed);
  --mdc-theme-secondary: var(--white);

  @media (prefers-color-scheme: dark) {
    --mdc-theme-secondary: var(--black);
  }

  &.toggled {
    --mdc-theme-secondary: var(--super-dimmed-primary);
    --mdc-theme-on-secondary: var(--mdc-theme-primary);
  }
}
</style>
