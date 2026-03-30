import Parse from 'parse';

// Back4App Parse initialization
Parse.initialize(
    import.meta.env.VITE_BACK4APP_APP_ID || '',
    import.meta.env.VITE_BACK4APP_JS_KEY || ''
);
Parse.serverURL = import.meta.env.VITE_BACK4APP_SERVER_URL || 'https://parseapi.back4app.com';

// Live Query for real-time subscriptions
if (import.meta.env.VITE_BACK4APP_LIVE_QUERY_URL) {
    Parse.liveQueryServerURL = import.meta.env.VITE_BACK4APP_LIVE_QUERY_URL;
}

// Back4App AI Agent config
export const AGENT_CONFIG = {
    id: import.meta.env.VITE_BACK4APP_AGENT_ID || '9e49b410-27bf-489f-9470-2cd8d465d545',
    url: import.meta.env.VITE_BACK4APP_AGENT_URL ||
        'https://containers.back4app.com/agents/9e49b410-27bf-489f-9470-2cd8d465d545',
};

export default Parse;
