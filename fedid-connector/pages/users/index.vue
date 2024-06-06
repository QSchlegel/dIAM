<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Fedid User List of Instance {{ instanceId }}</h1>
      <div class="flex items-center">
        <button @click="refreshData" class="flex items-center text-gray-600 mr-4">
          <svg v-if="loading" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span v-if="!loading">Refresh</span>
          <span v-if="loading">Refreshing...</span>
        </button>
        <button @click="openExportModal" class="text-blue-500 hover:text-blue-700 mr-4">
          Export Users
        </button>
        <button @click="openImportModal" class="text-blue-500 hover:text-blue-700">
          Import Users
        </button>
      </div>
    </div>
    <div class="bg-white shadow-md rounded my-6">
      <table class="min-w-max w-full table-auto">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Username</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">ID</th>
            <th class="py-3 px-6 text-left">Realm ID</th>
            <th class="py-3 px-6 text-left">Created Timestamp</th>
            <th class="py-3 px-6 text-left">Roles</th>
            <th class="py-3 px-6 text-left">Has Passkey</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-for="user in users" :key="user.id" class="border-b border-gray-200 hover:bg-gray-100">
            <td class="py-3 px-6 text-left whitespace-nowrap">{{ user.username }}</td>
            <td class="py-3 px-6 text-left">{{ user.email }}</td>
            <td class="py-3 px-6 text-left">{{ formatId(user.id) }}</td>
            <td class="py-3 px-6 text-left">{{ formatId(user.realm_id) }}</td>
            <td class="py-3 px-6 text-left">{{ formatDate(user.created_timestamp) }}</td>
            <td class="py-3 px-6 text-left">
              <div v-if="user.roles.length > 1">
                <span>{{ formatId(user.roles[0]) }}</span>
                <button @click="toggleRoles(user.id)" class="text-blue-500 hover:text-blue-700 ml-2">
                  {{ user.expanded ? 'Show Less' : 'Show More' }}
                </button>
                <ul v-if="user.expanded" class="mt-2">
                  <li v-for="(role, index) in user.roles.slice(1)" :key="index">{{ formatId(role) }}</li>
                </ul>
              </div>
              <div v-else>
                <span>{{ formatId(user.roles[0]) }}</span>
              </div>
            </td>
            <td class="py-3 px-6 text-left">{{ user.hasPasskey ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Export Users
                </h3>
                <div class="mt-2">
                  <input type="text" v-model="searchQuery" placeholder="Search users..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <ul class="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    <li v-for="user in filteredUsersWithPasskey" :key="user.id"
                      class="px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                      <NuxtLink :to="{
                        path: `/users/export/${user.id}`,
                        query: { db: instanceId }
                      }">
                        {{ user.username }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="closeExportModal" type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
              Close
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Import Users
                </h3>
                <div class="mt-2">
                  <input type="text" v-model="importSearchQuery" placeholder="Search users..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <ul class="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    <li v-for="user in importableUsers" :key="user.id"
                      class="px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                      <NuxtLink :to="{
                        path: `/users/import/${user.credentialSubject.user.id}`,
                        query: { db: instanceId }
                      }">
                        {{ user.credentialSubject.user.email }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="closeImportModal" type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
              Close
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

const route = useRoute()
const instanceId = ref(route.query.db || 1) // Default to 1 if not provided
const users = ref([])
const loading = ref(false)
const showExportModal = ref(false)
const showImportModal = ref(false)
const searchQuery = ref('')
const importSearchQuery = ref('')

var importableUsers = ref('')

const refreshData = async () => {
  loading.value = true

  try {
    const { data: userData } = await useFetch(`/api/local/users?db=${instanceId.value}`)
    const { data: rolesData } = await useFetch(`/api/local/roles?db=${instanceId.value}`)
    const { data: credentialsData } = await useFetch(`/api/local/credentials?db=${instanceId.value}`)

    if (userData.value && rolesData.value && credentialsData.value) {
      const rolesMap = rolesData.value.reduce((acc, role) => {
        if (!acc[role.user_id]) {
          acc[role.user_id] = []
        }
        acc[role.user_id].push(role.role_id)
        return acc
      }, {})

      const credentialsMap = credentialsData.value.reduce((acc, credential) => {
        if (credential.type === 'webauthn-passwordless') {
          acc[credential.user_id] = true
        }
        return acc
      }, {})

      users.value = userData.value.map(user => ({
        ...user,
        roles: rolesMap[user.id] || [],
        hasPasskey: credentialsMap[user.id] || false,
        expanded: false
      }))
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const toggleRoles = (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.expanded = !user.expanded
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = dayjs(Number(timestamp))
  if (date.isValid()) {
    return date.format('DD/MM/YYYY')
  }
  return ''
}

const formatId = (id) => {
  if (id.length > 10) {
    return `${id.slice(0, 5)} ... ${id.slice(-5)}`
  }
  return id
}

const openExportModal = () => {
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
  searchQuery.value = ''
}

const openImportModal = async () => {
  await loadVerifiableCrdentials();
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
  importSearchQuery.value = ''
}

const filteredUsersWithPasskey = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.hasPasskey &&
    user.username.toLowerCase().includes(query)
  )
})

const filteredUsersForImport = (importableUsers) => {
  if (importableUsers) {
    const query = importSearchQuery.value.toLowerCase()
    return importableUsers.filter(vc =>
      vc.credentialSubject.user.email.toLowerCase().includes(query)
    )
  } else {
    return []
  }

}

const loadVerifiableCrdentials = async () => {
  const { data: verifiableCredentials } = await useFetch(`/api/remote/vcs`)
  importableUsers.value = filteredUsersForImport(verifiableCredentials.value)
}

// Fetch data initially when the component is mounted
onMounted(() => {
  refreshData()
})
</script>
