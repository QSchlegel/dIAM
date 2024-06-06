<template>
    <div class="max-w-3xl mx-auto p-6 border border-gray-300 rounded-lg bg-white">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold">User ID: {{ $route.params.id }}</h1>
            <h2 class="text-xl text-gray-600">Database: {{ $route.query.db || 'default' }}</h2>
        </div>

        <div class="space-y-8">
            <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold mb-4">Credential Data</h3>
                <p v-if="loading" class="text-gray-500 italic">Loading...</p>
                <pre v-else class="bg-white p-4 rounded-lg overflow-auto">{{ credentialData }}</pre>
                <button @click="refreshData" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Refresh Data</button>
            </div>

            <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold mb-4">Generate Verifiable Credential</h3>
                <button @click="generateCredential" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Generate Credential</button>
                <pre class="bg-white p-4 mt-4 rounded-lg overflow-auto">{{ verifiableCredential }}</pre>
            </div>

            <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold mb-4">Upload Verifiable Credential</h3>
                <button 
                    @click="uploadCredential" 
                    :disabled="!verifiableCredential || uploadSuccess"
                    class="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Upload
                    <span v-if="uploadSuccess" class="ml-2 text-green-500">✔</span>
                    <span v-if="uploadError" class="ml-2 text-red-500">✖</span>
                </button>
                <p v-if="uploadError" class="text-red-500 mt-2">{{ uploadError }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const credentialData = ref();
const verifiableCredential = ref();

const route = useRoute();
const instanceId = ref(route.query.db || 1); // Default to 1 if not provided
const userId = ref(route.params.id);
const loading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref('');

const filterUserData = (user) => {
    const { id, email, first_name, last_name, username, created_timestamp } = user;
    return { id, email, first_name, last_name, username, created_timestamp };
};

const filterCredentialData = (credential) => {
    const { created_date, credential_data, user_label } = credential;
    return { user_label, created_date, passkey: JSON.parse(credential_data) };
};

const generateCredential = async () => {
    const filteredUserData = filterUserData(credentialData.value[1]);
    const filteredCredentialData = filterCredentialData(credentialData.value[0]);
    const { data: body } = await useFetch('/api/veramo/issue-credential', {
        method: 'post',
        query: { alias: 'default' },
        body: { credential: filteredCredentialData, user: filteredUserData }
    });
    verifiableCredential.value = body;
};

const refreshData = async () => {
    loading.value = true;
    try {
        const { data: credentialsData } = await useFetch(`/api/local/credentials?db=${instanceId.value}`);
        const { data: userData } = await useFetch(`/api/local/users?db=${instanceId.value}`);

        if (userData.value && credentialsData.value) {
            console.log(userData.value);
            const userFilter = userData.value.filter(f => f.id === userId.value);
            const credentialsFilter = credentialsData.value.filter(f => f.user_id === userId.value);
            credentialData.value = [credentialsFilter[0], userFilter[0]];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false;
    }
};

const uploadCredential = async () => {
    try {
        await useFetch('/api/remote/vcs', {
            method: 'post',
            body: verifiableCredential.value
        });
        uploadSuccess.value = true;
        uploadError.value = '';
    } catch (error) {
        console.error('Error uploading credential:', error);
        uploadError.value = error.message || 'Error uploading credential';
        uploadSuccess.value = false;
    }
};

onMounted(() => {
    refreshData();
});
</script>