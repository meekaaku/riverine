
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const DB_URL: string;
	export const DB_USER: string;
	export const DB_PASSWORD: string;
	export const DB_HOST: string;
	export const DB_NAME: string;
	export const DB_PORT: string;
	export const DB_SSL: string;
	export const PORT: string;
	export const DO_SPACES_KEY: string;
	export const DO_SPACES_SECRET: string;
	export const DO_SPACES_ENDPOINT: string;
	export const DO_SPACES_REGION: string;
	export const DO_SPACES_BUCKET: string;
	export const DO_PATH_PREFIX: string;
	export const SHELL: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const UV_CACHE_DIR: string;
	export const CURSOR_SANDBOX: string;
	export const __CURSOR_SANDBOX_ENV_RESTORE: string;
	export const npm_config_userconfig: string;
	export const QT_SCREEN_SCALE_FACTORS: string;
	export const XDG_CONFIG_DIRS: string;
	export const LESS: string;
	export const XDG_SESSION_PATH: string;
	export const NVM_INC: string;
	export const no_proxy: string;
	export const _ZO_DOCTOR: string;
	export const XDG_MENU_PREFIX: string;
	export const PERLLIB: string;
	export const ICEAUTHORITY: string;
	export const LANGUAGE: string;
	export const NPM_CONFIG_CACHE: string;
	export const NODE: string;
	export const LESS_TERMCAP_se: string;
	export const LESS_TERMCAP_so: string;
	export const LC_ADDRESS: string;
	export const VSCODE_PROCESS_TITLE: string;
	export const LC_NAME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const GTK_RC_FILES: string;
	export const NO_AT_BRIDGE: string;
	export const PNPM_STORE_PATH: string;
	export const npm_config_globalconfig: string;
	export const YARN_CACHE_FOLDER: string;
	export const CURSOR_EXTENSION_HOST_ROLE: string;
	export const SOCKS5_PROXY: string;
	export const EDITOR: string;
	export const TURBO_CACHE_DIR: string;
	export const GTK_MODULES: string;
	export const XDG_SEAT: string;
	export const CARGO_TARGET_DIR: string;
	export const PWD: string;
	export const GSETTINGS_SCHEMA_DIR: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const XDG_SESSION_TYPE: string;
	export const CCACHE_DIR: string;
	export const GIT_HTTP_PROXY: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const npm_config_init_module: string;
	export const SYSTEMD_EXEC_PID: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const _: string;
	export const XAUTHORITY: string;
	export const LS_OPTIONS: string;
	export const GIT_HTTPS_PROXY: string;
	export const MOTD_SHOWN: string;
	export const GTK2_RC_FILES: string;
	export const HOME: string;
	export const LC_PAPER: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_config_devdir: string;
	export const npm_package_version: string;
	export const VSCODE_IPC_HOOK: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const FORCE_COLOR: string;
	export const XDG_SEAT_PATH: string;
	export const https_proxy: string;
	export const POETRY_CACHE_DIR: string;
	export const INVOCATION_ID: string;
	export const PLAYWRIGHT_BROWSERS_PATH: string;
	export const MANAGERPID: string;
	export const PUPPETEER_CACHE_DIR: string;
	export const CP_HOME_DIR: string;
	export const PIP_CACHE_DIR: string;
	export const GOMODCACHE: string;
	export const socks_proxy: string;
	export const INIT_CWD: string;
	export const GEM_SPEC_CACHE: string;
	export const CHROME_DESKTOP: string;
	export const KDE_SESSION_UID: string;
	export const APPDIR: string;
	export const npm_lifecycle_script: string;
	export const NVM_DIR: string;
	export const CURSOR_AGENT: string;
	export const GRADLE_USER_HOME: string;
	export const npm_config_npm_version: string;
	export const XDG_SESSION_CLASS: string;
	export const socks5_proxy: string;
	export const CYPRESS_CACHE_FOLDER: string;
	export const TERM: string;
	export const LC_IDENTIFICATION: string;
	export const npm_package_name: string;
	export const LESS_TERMCAP_mb: string;
	export const LESS_TERMCAP_me: string;
	export const LESS_TERMCAP_md: string;
	export const npm_config_prefix: string;
	export const USER: string;
	export const NO_PROXY: string;
	export const NX_CACHE_DIRECTORY: string;
	export const OWD: string;
	export const QT_WAYLAND_RECONNECT: string;
	export const EVERYSPHERE_RIPGREP_PATH: string;
	export const KDE_SESSION_VERSION: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const CURSOR_SANDBOX_LANDLOCK_STATUS: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const VSCODE_PID: string;
	export const SHLVL: string;
	export const LESS_TERMCAP_ue: string;
	export const NVM_CD_FLAGS: string;
	export const LESS_TERMCAP_us: string;
	export const LC_TELEPHONE: string;
	export const HTTPS_PROXY: string;
	export const HTTP_PROXY: string;
	export const LC_MEASUREMENT: string;
	export const VSCODE_CWD: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const QT_LINUX_ACCESSIBILITY_ALWAYS_ON: string;
	export const http_proxy: string;
	export const GOCACHE: string;
	export const npm_config_user_agent: string;
	export const NO_COLOR: string;
	export const NUGET_PACKAGES: string;
	export const npm_execpath: string;
	export const FC_FONTATIONS: string;
	export const LD_LIBRARY_PATH: string;
	export const APPIMAGE: string;
	export const VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
	export const XDG_RUNTIME_DIR: string;
	export const ALL_PROXY: string;
	export const BUNDLE_PATH: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const LC_TIME: string;
	export const CONDA_PKGS_DIRS: string;
	export const BUN_INSTALL: string;
	export const P9K_SSH: string;
	export const SOCKS_PROXY: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const JOURNAL_STREAM: string;
	export const GTK3_MODULES: string;
	export const XDG_DATA_DIRS: string;
	export const KDE_FULL_SESSION: string;
	export const GDK_BACKEND: string;
	export const all_proxy: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const CI: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_config_global_prefix: string;
	export const VSCODE_NLS_CONFIG: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const NVM_BIN: string;
	export const MAIL: string;
	export const QT_PLUGIN_PATH: string;
	export const HOMEBREW_CACHE: string;
	export const COMPOSER_HOME: string;
	export const npm_node_execpath: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const LC_NUMERIC: string;
	export const BUN_INSTALL_CACHE_DIR: string;
	export const OLDPWD: string;
	export const CURSOR_TRACE_ID: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		DB_URL: string;
		DB_USER: string;
		DB_PASSWORD: string;
		DB_HOST: string;
		DB_NAME: string;
		DB_PORT: string;
		DB_SSL: string;
		PORT: string;
		DO_SPACES_KEY: string;
		DO_SPACES_SECRET: string;
		DO_SPACES_ENDPOINT: string;
		DO_SPACES_REGION: string;
		DO_SPACES_BUCKET: string;
		DO_PATH_PREFIX: string;
		SHELL: string;
		npm_command: string;
		SESSION_MANAGER: string;
		UV_CACHE_DIR: string;
		CURSOR_SANDBOX: string;
		__CURSOR_SANDBOX_ENV_RESTORE: string;
		npm_config_userconfig: string;
		QT_SCREEN_SCALE_FACTORS: string;
		XDG_CONFIG_DIRS: string;
		LESS: string;
		XDG_SESSION_PATH: string;
		NVM_INC: string;
		no_proxy: string;
		_ZO_DOCTOR: string;
		XDG_MENU_PREFIX: string;
		PERLLIB: string;
		ICEAUTHORITY: string;
		LANGUAGE: string;
		NPM_CONFIG_CACHE: string;
		NODE: string;
		LESS_TERMCAP_se: string;
		LESS_TERMCAP_so: string;
		LC_ADDRESS: string;
		VSCODE_PROCESS_TITLE: string;
		LC_NAME: string;
		MEMORY_PRESSURE_WRITE: string;
		ELECTRON_RUN_AS_NODE: string;
		COLOR: string;
		npm_config_local_prefix: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		GTK_RC_FILES: string;
		NO_AT_BRIDGE: string;
		PNPM_STORE_PATH: string;
		npm_config_globalconfig: string;
		YARN_CACHE_FOLDER: string;
		CURSOR_EXTENSION_HOST_ROLE: string;
		SOCKS5_PROXY: string;
		EDITOR: string;
		TURBO_CACHE_DIR: string;
		GTK_MODULES: string;
		XDG_SEAT: string;
		CARGO_TARGET_DIR: string;
		PWD: string;
		GSETTINGS_SCHEMA_DIR: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		XDG_SESSION_TYPE: string;
		CCACHE_DIR: string;
		GIT_HTTP_PROXY: string;
		VSCODE_ESM_ENTRYPOINT: string;
		npm_config_init_module: string;
		SYSTEMD_EXEC_PID: string;
		VSCODE_CODE_CACHE_PATH: string;
		_: string;
		XAUTHORITY: string;
		LS_OPTIONS: string;
		GIT_HTTPS_PROXY: string;
		MOTD_SHOWN: string;
		GTK2_RC_FILES: string;
		HOME: string;
		LC_PAPER: string;
		LANG: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		npm_config_devdir: string;
		npm_package_version: string;
		VSCODE_IPC_HOOK: string;
		MEMORY_PRESSURE_WATCH: string;
		FORCE_COLOR: string;
		XDG_SEAT_PATH: string;
		https_proxy: string;
		POETRY_CACHE_DIR: string;
		INVOCATION_ID: string;
		PLAYWRIGHT_BROWSERS_PATH: string;
		MANAGERPID: string;
		PUPPETEER_CACHE_DIR: string;
		CP_HOME_DIR: string;
		PIP_CACHE_DIR: string;
		GOMODCACHE: string;
		socks_proxy: string;
		INIT_CWD: string;
		GEM_SPEC_CACHE: string;
		CHROME_DESKTOP: string;
		KDE_SESSION_UID: string;
		APPDIR: string;
		npm_lifecycle_script: string;
		NVM_DIR: string;
		CURSOR_AGENT: string;
		GRADLE_USER_HOME: string;
		npm_config_npm_version: string;
		XDG_SESSION_CLASS: string;
		socks5_proxy: string;
		CYPRESS_CACHE_FOLDER: string;
		TERM: string;
		LC_IDENTIFICATION: string;
		npm_package_name: string;
		LESS_TERMCAP_mb: string;
		LESS_TERMCAP_me: string;
		LESS_TERMCAP_md: string;
		npm_config_prefix: string;
		USER: string;
		NO_PROXY: string;
		NX_CACHE_DIRECTORY: string;
		OWD: string;
		QT_WAYLAND_RECONNECT: string;
		EVERYSPHERE_RIPGREP_PATH: string;
		KDE_SESSION_VERSION: string;
		PAM_KWALLET5_LOGIN: string;
		CURSOR_SANDBOX_LANDLOCK_STATUS: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		VSCODE_PID: string;
		SHLVL: string;
		LESS_TERMCAP_ue: string;
		NVM_CD_FLAGS: string;
		LESS_TERMCAP_us: string;
		LC_TELEPHONE: string;
		HTTPS_PROXY: string;
		HTTP_PROXY: string;
		LC_MEASUREMENT: string;
		VSCODE_CWD: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		QT_LINUX_ACCESSIBILITY_ALWAYS_ON: string;
		http_proxy: string;
		GOCACHE: string;
		npm_config_user_agent: string;
		NO_COLOR: string;
		NUGET_PACKAGES: string;
		npm_execpath: string;
		FC_FONTATIONS: string;
		LD_LIBRARY_PATH: string;
		APPIMAGE: string;
		VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
		XDG_RUNTIME_DIR: string;
		ALL_PROXY: string;
		BUNDLE_PATH: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		LC_TIME: string;
		CONDA_PKGS_DIRS: string;
		BUN_INSTALL: string;
		P9K_SSH: string;
		SOCKS_PROXY: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		JOURNAL_STREAM: string;
		GTK3_MODULES: string;
		XDG_DATA_DIRS: string;
		KDE_FULL_SESSION: string;
		GDK_BACKEND: string;
		all_proxy: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		CI: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_config_global_prefix: string;
		VSCODE_NLS_CONFIG: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		NVM_BIN: string;
		MAIL: string;
		QT_PLUGIN_PATH: string;
		HOMEBREW_CACHE: string;
		COMPOSER_HOME: string;
		npm_node_execpath: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		LC_NUMERIC: string;
		BUN_INSTALL_CACHE_DIR: string;
		OLDPWD: string;
		CURSOR_TRACE_ID: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
