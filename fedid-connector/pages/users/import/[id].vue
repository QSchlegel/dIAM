<template>
    <div class="max-w-3xl mx-auto p-6 border border-gray-300 rounded-lg bg-white">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold">User Import</h1>
            <h2 class="text-xl text-gray-600">User ID: {{ userId }}</h2>
            <h2 class="text-xl text-gray-600">Database: {{ instanceId }}</h2>
        </div>

        <div v-if="loading" class="text-center text-gray-500 italic">Loading...</div>

        <div v-else>
            <div class="space-y-8">
                <div class="bg-gray-100 p-6 space-y-4 rounded-lg shadow-md">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <h1 class="text-lg font-semibold mb-4 text-green-500" v-if="verificationSuccess">✔  </h1>
                            <h1 class="text-lg font-semibold mb-4 text-red-500" v-if="verificationError">⚠  </h1>
                            <h3 class="text-lg font-semibold mb-4"> Verifiable Credential </h3>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <button @click="refreshVerifiableCredential"
                                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Refresh
                            </button>
                            <button @click="verifyVerifiableCredential" :disabled="!verifiableCredential"
                                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4">
                                Verify
                            </button>
                        </div>
                    </div>
                    <pre class="bg-white p-4 rounded-lg overflow-auto">{{ verifiableCredential }}</pre>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Select Realm ID</h3>
                    <select v-model="selectedRealmId" class="w-full p-2 border border-gray-300 rounded">
                        <option v-for="(count, realmId) in sortedRealmIds" :key="realmId" :value="realmId">
                            {{ realmId }} ({{ count }})
                        </option>
                    </select>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Select Role ID</h3>
                    <select v-model="selectedRoleId" class="w-full p-2 border border-gray-300 rounded">
                        <option v-for="(count, roleId) in sortedRoleIds" :key="roleId" :value="roleId">
                            {{ roleId }} ({{ count }})
                        </option>
                    </select>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Import Preview</h3>
                    <pre class="bg-white p-4 rounded-lg overflow-auto">{{ importPreview }}</pre>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Role Assignment Preview</h3>
                    <pre class="bg-white p-4 rounded-lg overflow-auto">{{ roleAssignmentPreview }}</pre>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Credential Preview</h3>
                    <pre class="bg-white p-4 rounded-lg overflow-auto">{{ credentialPreview }}</pre>
                </div>

                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-4">Import User Data</h3>
                    <button @click="importUserData" :disabled="importSuccess"
                        class="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Import
                        <span v-if="importSuccess" class="ml-2 text-green-500">✔</span>
                        <span v-if="importError" class="ml-2 text-red-500">✖</span>
                    </button>
                    <p v-if="importError" class="text-red-500 mt-2">{{ importError }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const route = useRoute();
const userId = ref(route.params.id);
const instanceId = ref(route.query.db || 'default');
const loading = ref(false);
const userData = ref({});
const credentialData = ref({});
const verifiableCredential = ref(null);
const selectedRealmId = ref('');
const realmIdCounts = ref({});
const selectedRoleId = ref('');
const roleIdCounts = ref({});
const importSuccess = ref(false);
const importError = ref('');
const verificationSuccess = ref(false);
const verificationError = ref(false);

const fetchData = async () => {
    try {
        const { data: response } = await useFetch(`/api/remote/vcs?id=${userId.value}`);
        if (Array.isArray(response.value) && response.value.length > 0) {
            const verifiableCredentialObj = response.value[0];
            console.log(verifiableCredentialObj)
            const { credentialSubject: { user, credential } } = verifiableCredentialObj;

            userData.value = user;
            credentialData.value = credential;
            verifiableCredential.value = verifiableCredentialObj;
        }

        await fetchLocalUsers();
        await fetchLocalRoles();
        loading.value = false;
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false;
    }
};

const verifyVerifiableCredential = async () => {
    try {
        const { data: response } = await useFetch('/api/veramo/verify-credential', {
            method: 'post',
            body: verifiableCredential.value
        });
        if (response.value.verified) {
            verificationSuccess.value = true;
            verificationError.value = false;
        } else {
            verificationError.value = true;
            alert('Verifiable Credential is invalid!');
        }
    } catch (error) {
        console.error('Error verifying verifiable credential:', error);
        verificationError.value = true;
        alert('Verifiable Credential is invalid!');
    }
};

const refreshVerifiableCredential = async () => {
    try {
        await fetchData();
    } catch (error) {
        console.error('Error refreshing verifiable credential:', error);
    } finally {
        loading.value = false;
    }
};

const fetchLocalUsers = async () => {
    try {
        const { data: localUsers } = await useFetch(`/api/local/users?db=${instanceId.value}`);
        const counts = localUsers.value.reduce((acc, user) => {
            acc[user.realm_id] = (acc[user.realm_id] || 0) + 1;
            return acc;
        }, {});
        realmIdCounts.value = counts;

        // Preselect the realm_id with the highest count
        const highestCountRealmId = Object.entries(realmIdCounts.value).sort(([, a], [, b]) => b - a)[0][0];
        selectedRealmId.value = highestCountRealmId;
    } catch (error) {
        console.error('Error fetching local users:', error);
    }
};

const fetchLocalRoles = async () => {
    try {
        const { data: localRoles } = await useFetch(`/api/local/roles?db=${instanceId.value}`);
        const counts = localRoles.value.reduce((acc, role) => {
            acc[role.role_id] = (acc[role.role_id] || 0) + 1;
            return acc;
        }, {});
        roleIdCounts.value = counts;

        // Preselect the role_id with the highest count
        const highestCountRoleId = Object.entries(roleIdCounts.value).sort(([, a], [, b]) => b - a)[0][0];
        selectedRoleId.value = highestCountRoleId;
    } catch (error) {
        console.error('Error fetching local roles:', error);
    }
};

const sortedRealmIds = computed(() => {
    return Object.entries(realmIdCounts.value)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [realmId, count]) => ({ ...acc, [realmId]: count }), {});
});

const sortedRoleIds = computed(() => {
    return Object.entries(roleIdCounts.value)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [roleId, count]) => ({ ...acc, [roleId]: count }), {});
});

const importPreview = computed(() => {
    return {
        id: userData.value.id,
        email: userData.value.email,
        email_constraint: userData.value.email,
        email_verified: false,
        enabled: true,
        federation_link: null,
        first_name: userData.value.first_name,
        last_name: userData.value.last_name,
        realm_id: selectedRealmId.value,
        username: userData.value.username,
        created_timestamp: userData.value.created_timestamp,
        service_account_client_link: null,
        not_before: 0,
    };
});

const roleAssignmentPreview = computed(() => {
    return {
        role_id: selectedRoleId.value,
        user_id: userData.value.id,
    };
});

const credentialPreview = computed(() => {
    if (credentialData.value && credentialData.value.passkey) {
        return {
            id: crypto.randomUUID(),
            salt: null,
            type: "webauthn-passwordless",
            user_id: userData.value.id,
            created_date: credentialData.value.created_date,
            user_label: credentialData.value.user_label,
            secret_data: "{}",
            credential_data: JSON.stringify({
                aaguid: credentialData.value.passkey.aaguid,
                credentialId: credentialData.value.passkey.credentialId,
                counter: credentialData.value.passkey.counter,
                credentialPublicKey: credentialData.value.passkey.credentialPublicKey,
                attestationStatementFormat: credentialData.value.passkey.attestationStatementFormat,
                transports: credentialData.value.passkey.transports,
            }),
            priority: 10
        };
    } else {
        return ''
    }

});

const importUserData = async () => {
    try {
        await useFetch(`/api/local/users?db=${instanceId.value}`, {
            method: 'post',
            body: importPreview.value
        });
        await useFetch(`/api/local/roles?db=${instanceId.value}`, {
            method: 'post',
            body: roleAssignmentPreview.value
        });
        await useFetch(`/api/local/credentials?db=${instanceId.value}`, {
            method: 'post',
            body: credentialPreview.value
        });
        importSuccess.value = true;
        importError.value = '';
    } catch (error) {
        console.error('Error importing user data:', error);
        importError.value = error.message || 'Error importing user data';
        importSuccess.value = false;
    }
};

onMounted(() => {
    fetchData();
});

</script>