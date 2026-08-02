Run npm ci
npm warn skipping integrity check for git dependency ssh://git@github.com/electron/node-gyp.git
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated gar@1.0.4: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated @npmcli/move-file@2.0.1: This functionality has been moved to @npmcli/fs
npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.hirok.io
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.hirok.io
npm warn deprecated glob@8.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@8.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm warn deprecated boolean@3.2.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
npm error code 1
npm error path D:\a\fine-desktop\fine-desktop\node_modules\better-sqlite3
npm error command failed
npm error command C:\Windows\system32\cmd.exe /d /s /c node-gyp rebuild
npm error gyp info it worked if it ends with ok
npm error gyp verb cli [
npm error gyp verb cli 'C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe',
npm error gyp verb cli 'D:\\a\\fine-desktop\\fine-desktop\\node_modules\\@electron\\node-gyp\\bin\\node-gyp.js',
npm error gyp verb cli 'rebuild'
npm error gyp verb cli ]
npm error gyp info using node-gyp@10.2.0-electron.1
npm error gyp info using node@22.23.1 | win32 | x64
npm error gyp verb clean removing "build" directory
npm error gyp verb find Python Python is not set from command line or npm configuration
npm error gyp verb find Python Python is not set from environment variable PYTHON
npm error gyp verb find Python checking if the py launcher can be used to find Python 3
npm error gyp verb find Python - executing "py.exe" to get Python 3 executable path
npm error gyp sill find Python execFile: exec = "py.exe"
npm error gyp sill find Python execFile: args = ["-3","-c","import sys; sys.stdout.buffer.write(sys.executable.encode('utf-8'));"]
npm error gyp sill find Python execFile: opts = {"env":{"ACTIONS_ORCHESTRATION_ID":"c6475454-9239-4905-a643-e4d48e670498.publish.windows-latest","ACTIONS_RUNNER_ACTION_ARCHIVE_CACHE":"C:\\actionarchivecache\\","ACTIONS_RUNNER_RETURN_JOB_RESULT_FOR_HOSTED":"1","AGENT_TOOLSDIRECTORY":"C:\\hostedtoolcache\\windows","ALLUSERSPROFILE":"C:\\ProgramData","ANDROID_HOME":"C:\\Android\\android-sdk","ANDROID_NDK":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_NDK_HOME":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_NDK_LATEST_HOME":"C:\\Android\\android-sdk\\ndk\\29.0.14206865","ANDROID_NDK_ROOT":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_SDK_ROOT":"C:\\Android\\android-sdk","ANT_HOME":"C:\\ProgramData\\chocolatey\\lib\\ant\\tools\\apache-ant-1.10.17","APPDATA":"C:\\Users\\runneradmin\\AppData\\Roaming","AZURE_CONFIG_DIR":"C:\\azureCli","AZURE_DEVOPS_CACHE_DIR":"C:\\azureDevOpsCli\\cache","AZURE_EXTENSION_DIR":"C:\\Program Files\\Common Files\\AzureCliExtensionDirectory","AZ_DEVOPS_GLOBAL_CONFIG_DIR":"C:\\azureDevOpsCli","CABAL_DIR":"C:\\cabal","ChocolateyInstall":"C:\\ProgramData\\chocolatey","ChromeWebDriver":"C:\\SeleniumWebDrivers\\ChromeDriver","CI":"true","COBERTURA_HOME":"C:\\cobertura-2.1.1","COLOR":"0","CommonProgramFiles":"C:\\Program Files\\Common Files","CommonProgramFiles(x86)":"C:\\Program Files (x86)\\Common Files","CommonProgramW6432":"C:\\Program Files\\Common Files","COMPUTERNAME":"runnervmhisb5","ComSpec":"C:\\Windows\\system32\\cmd.exe","CONDA":"C:\\Miniconda","DOTNET_MULTILEVEL_LOOKUP":"0","DOTNET_NOLOGO":"1","DOTNET_SKIP_FIRST_TIME_EXPERIENCE":"1","DriverData":"C:\\Windows\\System32\\Drivers\\DriverData","EdgeWebDriver":"C:\\SeleniumWebDrivers\\EdgeDriver","EDITOR":"C:\\Windows\\notepad.exe","ENABLE_RUNNER_TRACING":"true","GCM_INTERACTIVE":"Never","GeckoWebDriver":"C:\\SeleniumWebDrivers\\GeckoDriver","GHCUP_INSTALL_BASE_PREFIX":"C:\\","GHCUP_MSYS2":"C:\\msys64","GITHUB_ACTION":"__run","GITHUB_ACTIONS":"true","GITHUB_ACTION_REF":"","GITHUB_ACTION_REPOSITORY":"","GITHUB_ACTOR":"Nick-800","GITHUB_ACTOR_ID":"114080498","GITHUB_API_URL":"https://api.github.com","GITHUB_ARTIFACTS":"D:\\a\\_temp\\_runner_file_commands\\artifacts_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_ARTIFACTS_LIST":"D:\\a\\_temp\\_runner_file_commands\\artifacts_list_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_BASE_REF":"","GITHUB_ENV":"D:\\a\\_temp\\_runner_file_commands\\set_env_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_EVENT_NAME":"push","GITHUB_EVENT_PATH":"D:\\a\\_temp\\_github_workflow\\event.json","GITHUB_GRAPHQL_URL":"https://api.github.com/graphql","GITHUB_HEAD_REF":"","GITHUB_JOB":"publish","GITHUB_OUTPUT":"D:\\a\\_temp\\_runner_file_commands\\set_output_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_PATH":"D:\\a\\_temp\\_runner_file_commands\\add_path_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_REF":"refs/tags/v1.0.7","GITHUB_REF_NAME":"v1.0.7","GITHUB_REF_PROTECTED":"false","GITHUB_REF_TYPE":"tag","GITHUB_REPOSITORY":"NoraldenElhouni/fine-desktop","GITHUB_REPOSITORY_ID":"1307479922","GITHUB_REPOSITORY_OWNER":"NoraldenElhouni","GITHUB_REPOSITORY_OWNER_ID":"114868230","GITHUB_RETENTION_DAYS":"90","GITHUB_RUN_ATTEMPT":"1","GITHUB_RUN_ID":"30706913297","GITHUB_RUN_NUMBER":"9","GITHUB_SERVER_URL":"https://github.com","GITHUB_SHA":"538379ab3c20089451e79902daa970f5418c187d","GITHUB_STATE":"D:\\a\\_temp\\_runner_file_commands\\save_state_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_STEP_SUMMARY":"D:\\a\\_temp\\_runner_file_commands\\step_summary_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_TRIGGERING_ACTOR":"Nick-800","GITHUB_WORKFLOW":"Publish","GITHUB_WORKFLOW_REF":"NoraldenElhouni/fine-desktop/.github/workflows/release.yml@refs/tags/v1.0.7","GITHUB_WORKFLOW_SHA":"538379ab3c20089451e79902daa970f5418c187d","GITHUB_WORKSPACE":"D:\\a\\fine-desktop\\fine-desktop","GOROOT_1_24_X64":"C:\\hostedtoolcache\\windows\\go\\1.24.13\\x64","GOROOT_1_25_X64":"C:\\hostedtoolcache\\windows\\go\\1.25.12\\x64","GOROOT_1_26_X64":"C:\\hostedtoolcache\\windows\\go\\1.26.5\\x64","GRADLE_HOME":"C:\\ProgramData\\chocolatey\\lib\\gradle\\tools\\gradle-9.6.0","HOME":"C:\\Users\\runneradmin","HOMEDRIVE":"C:","HOMEPATH":"\\Users\\runneradmin","IEWebDriver":"C:\\SeleniumWebDrivers\\IEDriver","ImageOS":"win25-vs2026","ImageVersion":"20260728.188.1","INIT_CWD":"D:\\a\\fine-desktop\\fine-desktop","JAVA_HOME":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64","JAVA_HOME_11_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\11.0.31-11\\x64","JAVA_HOME_17_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64","JAVA_HOME_21_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\21.0.11-10.0\\x64","JAVA_HOME_25_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\25.0.4-7.0\\x64","JAVA_HOME_8_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\8.0.492-9\\x64","LOCALAPPDATA":"C:\\Users\\runneradmin\\AppData\\Local","LOGONSERVER":"\\\\runnervmhisb5","M2":"C:\\ProgramData\\chocolatey\\lib\\maven\\apache-maven-3.9.16\\bin","M2_REPO":"C:\\ProgramData\\m2","MAVEN_OPTS":"-Xms256m","NODE":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe","npm_command":"ci","npm_config_cache":"C:\\npm\\cache","npm_config_globalconfig":"C:\\npm\\prefix\\etc\\npmrc","npm_config_global_prefix":"C:\\npm\\prefix","npm_config_init_module":"C:\\Users\\runneradmin\\.npm-init.js","npm_config_local_prefix":"D:\\a\\fine-desktop\\fine-desktop","npm_config_node_gyp":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js","npm_config_noproxy":"","npm_config_npm_version":"10.9.8","npm_config_prefix":"C:\\npm\\prefix","npm_config_userconfig":"C:\\Users\\runneradmin\\.npmrc","npm_config_user_agent":"npm/10.9.8 node/v22.23.1 win32 x64 workspaces/false ci/github-actions","npm_execpath":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\bin\\npm-cli.js","npm_lifecycle_event":"install","npm_lifecycle_script":"node-gyp rebuild","npm_node_execpath":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe","npm_package_dev":"","npm_package_dev_optional":"","npm_package_engines_node":">=22","npm_package_integrity":"sha512-jW6oufeDhXZaiX9Lw5A+oerVClx4iFrI6uDj1zu7SqUAjak9vbJvA0NEcKLNxHiQHb6kYCoFzzXYV0YOauhV3g==","npm_package_json":"D:\\a\\fine-desktop\\fine-desktop\\node_modules\\better-sqlite3\\package.json","npm_package_name":"better-sqlite3","npm_package_optional":"","npm_package_peer":"","npm_package_resolved":"https://registry.npmjs.org/better-sqlite3/-/better-sqlite3-13.0.2.tgz","npm_package_version":"13.0.2","NUMBER_OF_PROCESSORS":"2","OS":"Windows_NT","Path":"D:\\a\\fine-desktop\\fine-desktop\\node_modules\\better-sqlite3\\node_modules\\.bin;D:\\a\\fine-desktop\\fine-desktop\\node_modules\\node_modules\\.bin;D:\\a\\fine-desktop\\fine-desktop\\node_modules\\.bin;D:\\a\\fine-desktop\\node_modules\\.bin;D:\\a\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Program Files\\PowerShell\\7;C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64;C:\\Program Files\\MongoDB\\Server\\7.0\\bin;C:\\vcpkg;C:\\tools\\zstd;C:\\hostedtoolcache\\windows\\stack\\3.11.1\\x64;C:\\cabal\\bin;C:\\\\ghcup\\bin;C:\\mingw64\\bin;C:\\Program Files\\dotnet;C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin;C:\\Program Files\\R\\R-4.6.1\\bin\\x64;C:\\SeleniumWebDrivers\\GeckoDriver;C:\\SeleniumWebDrivers\\EdgeDriver\\;C:\\SeleniumWebDrivers\\ChromeDriver;C:\\Program Files (x86)\\sbt\\bin;C:\\Program Files (x86)\\GitHub CLI;C:\\Program Files\\Git\\bin;C:\\Program Files (x86)\\pipx_bin;C:\\npm\\prefix;C:\\hostedtoolcache\\windows\\go\\1.24.13\\x64\\bin;C:\\hostedtoolcache\\windows\\Python\\3.12.10\\x64\\Scripts;C:\\hostedtoolcache\\windows\\Python\\3.12.10\\x64;C:\\hostedtoolcache\\windows\\Ruby\\3.3.12\\x64\\bin;C:\\Program Files\\OpenSSL\\bin;C:\\tools\\kotlinc\\bin;C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64\\bin;C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI;C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\wbin;C:\\ProgramData\\kind;C:\\ProgramData\\Chocolatey\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Windows\\System32\\OpenSSH\\;C:\\Program Files\\PowerShell\\7\\;C:\\Program Files\\Microsoft\\Web Platform Installer\\;C:\\Program Files\\Microsoft SQL Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files\\dotnet\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows Performance Toolkit\\;C:\\Program Files (x86)\\WiX Toolset v3.14\\bin;C:\\Program Files\\Microsoft SQL Server\\130\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\140\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\150\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\170\\DTS\\Binn\\;C:\\ProgramData\\chocolatey\\lib\\pulumi\\tools\\Pulumi\\bin;C:\\Program Files\\CMake\\bin;C:\\Strawberry\\c\\bin;C:\\Strawberry\\perl\\site\\bin;C:\\Strawberry\\perl\\bin;C:\\ProgramData\\chocolatey\\lib\\maven\\apache-maven-3.9.16\\bin;C:\\Program Files\\Microsoft Service Fabric\\bin\\Fabric\\Fabric.Code;C:\\Program Files\\Microsoft SDKs\\Service Fabric\\Tools\\ServiceFabricLocalClusterManager;C:\\Program Files\\nodejs\\;C:\\Program Files\\Git\\cmd;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\GitHub CLI\\;c:\\tools\\php;C:\\Program Files (x86)\\sbt\\bin;C:\\Program Files\\Amazon\\AWSCLIV2\\;C:\\Program Files\\Amazon\\SessionManagerPlugin\\bin\\;C:\\Program Files\\Amazon\\AWSSAMCLI\\bin\\;C:\\Program Files\\Microsoft SQL Server\\130\\Tools\\Binn\\;C:\\Program Files\\mongosh\\;C:\\Program Files\\LLVM\\bin;C:\\Program Files (x86)\\LLVM\\bin;C:\\Users\\runneradmin\\.dotnet\\tools;C:\\Users\\runneradmin\\.cargo\\bin;C:\\Users\\runneradmin\\AppData\\Local\\Microsoft\\WindowsApps","PATHEXT":".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL","PGBIN":"C:\\Program Files\\PostgreSQL\\17\\bin","PGDATA":"C:\\PostgreSQL\\17\\data","PGPASSWORD":"root","PGROOT":"C:\\Program Files\\PostgreSQL\\17","PGUSER":"postgres","PHPROOT":"c:\\tools\\php","PIPX_BIN_DIR":"C:\\Program Files (x86)\\pipx_bin","PIPX_HOME":"C:\\Program Files (x86)\\pipx","POWERSHELL_DISTRIBUTION_CHANNEL":"GitHub-Actions-win25-vs2026","POWERSHELL_UPDATECHECK":"Off","PROCESSOR_ARCHITECTURE":"AMD64","PROCESSOR_IDENTIFIER":"AMD64 Family 25 Model 1 Stepping 1, AuthenticAMD","PROCESSOR_LEVEL":"25","PROCESSOR_REVISION":"0101","ProgramData":"C:\\ProgramData","ProgramFiles":"C:\\Program Files","ProgramFiles(x86)":"C:\\Program Files (x86)","ProgramW6432":"C:\\Program Files","PROMPT":"$P$G","PSModuleAnalysisCachePath":"C:\\PSModuleAnalysisCachePath\\ModuleAnalysisCache","PSModulePath":"C:\\Users\\runneradmin\\Documents\\PowerShell\\Modules;C:\\Program Files\\PowerShell\\Modules;c:\\program files\\powershell\\7\\Modules;C:\\\\Modules\\az_15.6.1;C:\\Users\\packer\\Documents\\WindowsPowerShell\\Modules;C:\\Program Files\\WindowsPowerShell\\Modules;C:\\Windows\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program Files\\Microsoft SQL Server\\130\\Tools\\PowerShell\\Modules\\","PUBLIC":"C:\\Users\\Public","RTOOLS45_HOME":"C:\\rtools45","RUNNER_ARCH":"X64","RUNNER_ENVIRONMENT":"github-hosted","RUNNER_NAME":"GitHub Actions 1000000147","RUNNER_OS":"Windows","RUNNER_TEMP":"D:\\a\\_temp","RUNNER_TOOL_CACHE":"C:\\hostedtoolcache\\windows","RUNNER_TRACKING_ID":"github_ec6fd99f-f506-4b66-9051-1b19bd1e3208","RUNNER_WORKSPACE":"D:\\a\\fine-desktop","SBT_HOME":"C:\\Program Files (x86)\\sbt\\","SELENIUM_JAR_PATH":"C:\\selenium\\selenium-server.jar","SystemDrive":"C:","SystemRoot":"C:\\Windows","TEMP":"C:\\Users\\RUNNER~1\\AppData\\Local\\Temp","TMP":"C:\\Users\\RUNNER~1\\AppData\\Local\\Temp","USERDOMAIN":"runnervmhisb5","USERDOMAIN_ROAMINGPROFILE":"runnervmhisb5","USERNAME":"runneradmin","USERPROFILE":"C:\\Users\\runneradmin","VCPKG_INSTALLATION_ROOT":"C:\\vcpkg","windir":"C:\\Windows","WIX":"C:\\Program Files (x86)\\WiX Toolset v3.14\\","TERM":"dumb"},"shell":false}
npm error gyp sill find Python execFile result: err = null
npm error gyp sill find Python execFile result: stdout = "C:\\hostedtoolcache\\windows\\Python\\3.14.6\\x64\\python.exe"
npm error gyp sill find Python execFile result: stderr = ""
npm error gyp verb find Python - executable path is "C:\hostedtoolcache\windows\Python\3.14.6\x64\python.exe"
npm error gyp verb find Python - executing "C:\hostedtoolcache\windows\Python\3.14.6\x64\python.exe" to get version
npm error gyp sill find Python execFile: exec = "C:\\hostedtoolcache\\windows\\Python\\3.14.6\\x64\\python.exe"
npm error gyp sill find Python execFile: args = ["-c","import sys; print(\"%s.%s.%s\" % sys.version_info[:3]);"]
npm error gyp sill find Python execFile: opts = {"env":{"ACTIONS_ORCHESTRATION_ID":"c6475454-9239-4905-a643-e4d48e670498.publish.windows-latest","ACTIONS_RUNNER_ACTION_ARCHIVE_CACHE":"C:\\actionarchivecache\\","ACTIONS_RUNNER_RETURN_JOB_RESULT_FOR_HOSTED":"1","AGENT_TOOLSDIRECTORY":"C:\\hostedtoolcache\\windows","ALLUSERSPROFILE":"C:\\ProgramData","ANDROID_HOME":"C:\\Android\\android-sdk","ANDROID_NDK":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_NDK_HOME":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_NDK_LATEST_HOME":"C:\\Android\\android-sdk\\ndk\\29.0.14206865","ANDROID_NDK_ROOT":"C:\\Android\\android-sdk\\ndk\\27.3.13750724","ANDROID_SDK_ROOT":"C:\\Android\\android-sdk","ANT_HOME":"C:\\ProgramData\\chocolatey\\lib\\ant\\tools\\apache-ant-1.10.17","APPDATA":"C:\\Users\\runneradmin\\AppData\\Roaming","AZURE_CONFIG_DIR":"C:\\azureCli","AZURE_DEVOPS_CACHE_DIR":"C:\\azureDevOpsCli\\cache","AZURE_EXTENSION_DIR":"C:\\Program Files\\Common Files\\AzureCliExtensionDirectory","AZ_DEVOPS_GLOBAL_CONFIG_DIR":"C:\\azureDevOpsCli","CABAL_DIR":"C:\\cabal","ChocolateyInstall":"C:\\ProgramData\\chocolatey","ChromeWebDriver":"C:\\SeleniumWebDrivers\\ChromeDriver","CI":"true","COBERTURA_HOME":"C:\\cobertura-2.1.1","COLOR":"0","CommonProgramFiles":"C:\\Program Files\\Common Files","CommonProgramFiles(x86)":"C:\\Program Files (x86)\\Common Files","CommonProgramW6432":"C:\\Program Files\\Common Files","COMPUTERNAME":"runnervmhisb5","ComSpec":"C:\\Windows\\system32\\cmd.exe","CONDA":"C:\\Miniconda","DOTNET_MULTILEVEL_LOOKUP":"0","DOTNET_NOLOGO":"1","DOTNET_SKIP_FIRST_TIME_EXPERIENCE":"1","DriverData":"C:\\Windows\\System32\\Drivers\\DriverData","EdgeWebDriver":"C:\\SeleniumWebDrivers\\EdgeDriver","EDITOR":"C:\\Windows\\notepad.exe","ENABLE_RUNNER_TRACING":"true","GCM_INTERACTIVE":"Never","GeckoWebDriver":"C:\\SeleniumWebDrivers\\GeckoDriver","GHCUP_INSTALL_BASE_PREFIX":"C:\\","GHCUP_MSYS2":"C:\\msys64","GITHUB_ACTION":"__run","GITHUB_ACTIONS":"true","GITHUB_ACTION_REF":"","GITHUB_ACTION_REPOSITORY":"","GITHUB_ACTOR":"Nick-800","GITHUB_ACTOR_ID":"114080498","GITHUB_API_URL":"https://api.github.com","GITHUB_ARTIFACTS":"D:\\a\\_temp\\_runner_file_commands\\artifacts_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_ARTIFACTS_LIST":"D:\\a\\_temp\\_runner_file_commands\\artifacts_list_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_BASE_REF":"","GITHUB_ENV":"D:\\a\\_temp\\_runner_file_commands\\set_env_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_EVENT_NAME":"push","GITHUB_EVENT_PATH":"D:\\a\\_temp\\_github_workflow\\event.json","GITHUB_GRAPHQL_URL":"https://api.github.com/graphql","GITHUB_HEAD_REF":"","GITHUB_JOB":"publish","GITHUB_OUTPUT":"D:\\a\\_temp\\_runner_file_commands\\set_output_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_PATH":"D:\\a\\_temp\\_runner_file_commands\\add_path_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_REF":"refs/tags/v1.0.7","GITHUB_REF_NAME":"v1.0.7","GITHUB_REF_PROTECTED":"false","GITHUB_REF_TYPE":"tag","GITHUB_REPOSITORY":"NoraldenElhouni/fine-desktop","GITHUB_REPOSITORY_ID":"1307479922","GITHUB_REPOSITORY_OWNER":"NoraldenElhouni","GITHUB_REPOSITORY_OWNER_ID":"114868230","GITHUB_RETENTION_DAYS":"90","GITHUB_RUN_ATTEMPT":"1","GITHUB_RUN_ID":"30706913297","GITHUB_RUN_NUMBER":"9","GITHUB_SERVER_URL":"https://github.com","GITHUB_SHA":"538379ab3c20089451e79902daa970f5418c187d","GITHUB_STATE":"D:\\a\\_temp\\_runner_file_commands\\save_state_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_STEP_SUMMARY":"D:\\a\\_temp\\_runner_file_commands\\step_summary_6cf22da8-af71-492a-b641-13fbb586b4ac","GITHUB_TRIGGERING_ACTOR":"Nick-800","GITHUB_WORKFLOW":"Publish","GITHUB_WORKFLOW_REF":"NoraldenElhouni/fine-desktop/.github/workflows/release.yml@refs/tags/v1.0.7","GITHUB_WORKFLOW_SHA":"538379ab3c20089451e79902daa970f5418c187d","GITHUB_WORKSPACE":"D:\\a\\fine-desktop\\fine-desktop","GOROOT_1_24_X64":"C:\\hostedtoolcache\\windows\\go\\1.24.13\\x64","GOROOT_1_25_X64":"C:\\hostedtoolcache\\windows\\go\\1.25.12\\x64","GOROOT_1_26_X64":"C:\\hostedtoolcache\\windows\\go\\1.26.5\\x64","GRADLE_HOME":"C:\\ProgramData\\chocolatey\\lib\\gradle\\tools\\gradle-9.6.0","HOME":"C:\\Users\\runneradmin","HOMEDRIVE":"C:","HOMEPATH":"\\Users\\runneradmin","IEWebDriver":"C:\\SeleniumWebDrivers\\IEDriver","ImageOS":"win25-vs2026","ImageVersion":"20260728.188.1","INIT_CWD":"D:\\a\\fine-desktop\\fine-desktop","JAVA_HOME":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64","JAVA_HOME_11_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\11.0.31-11\\x64","JAVA_HOME_17_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64","JAVA_HOME_21_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\21.0.11-10.0\\x64","JAVA_HOME_25_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\25.0.4-7.0\\x64","JAVA_HOME_8_X64":"C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\8.0.492-9\\x64","LOCALAPPDATA":"C:\\Users\\runneradmin\\AppData\\Local","LOGONSERVER":"\\\\runnervmhisb5","M2":"C:\\ProgramData\\chocolatey\\lib\\maven\\apache-maven-3.9.16\\bin","M2_REPO":"C:\\ProgramData\\m2","MAVEN_OPTS":"-Xms256m","NODE":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe","npm_command":"ci","npm_config_cache":"C:\\npm\\cache","npm_config_globalconfig":"C:\\npm\\prefix\\etc\\npmrc","npm_config_global_prefix":"C:\\npm\\prefix","npm_config_init_module":"C:\\Users\\runneradmin\\.npm-init.js","npm_config_local_prefix":"D:\\a\\fine-desktop\\fine-desktop","npm_config_node_gyp":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js","npm_config_noproxy":"","npm_config_npm_version":"10.9.8","npm_config_prefix":"C:\\npm\\prefix","npm_config_userconfig":"C:\\Users\\runneradmin\\.npmrc","npm_config_user_agent":"npm/10.9.8 node/v22.23.1 win32 x64 workspaces/false ci/github-actions","npm_execpath":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\bin\\npm-cli.js","npm_lifecycle_event":"install","npm_lifecycle_script":"node-gyp rebuild","npm_node_execpath":"C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe","npm_package_dev":"","npm_package_dev_optional":"","npm_package_engines_node":">=22","npm_package_integrity":"sha512-jW6oufeDhXZaiX9Lw5A+oerVClx4iFrI6uDj1zu7SqUAjak9vbJvA0NEcKLNxHiQHb6kYCoFzzXYV0YOauhV3g==","npm_package_json":"D:\\a\\fine-desktop\\fine-desktop\\node_modules\\better-sqlite3\\package.json","npm_package_name":"better-sqlite3","npm_package_optional":"","npm_package_peer":"","npm_package_resolved":"https://registry.npmjs.org/better-sqlite3/-/better-sqlite3-13.0.2.tgz","npm_package_version":"13.0.2","NUMBER_OF_PROCESSORS":"2","OS":"Windows_NT","Path":"D:\\a\\fine-desktop\\fine-desktop\\node_modules\\better-sqlite3\\node_modules\\.bin;D:\\a\\fine-desktop\\fine-desktop\\node_modules\\node_modules\\.bin;D:\\a\\fine-desktop\\fine-desktop\\node_modules\\.bin;D:\\a\\fine-desktop\\node_modules\\.bin;D:\\a\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Program Files\\PowerShell\\7;C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64;C:\\Program Files\\MongoDB\\Server\\7.0\\bin;C:\\vcpkg;C:\\tools\\zstd;C:\\hostedtoolcache\\windows\\stack\\3.11.1\\x64;C:\\cabal\\bin;C:\\\\ghcup\\bin;C:\\mingw64\\bin;C:\\Program Files\\dotnet;C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin;C:\\Program Files\\R\\R-4.6.1\\bin\\x64;C:\\SeleniumWebDrivers\\GeckoDriver;C:\\SeleniumWebDrivers\\EdgeDriver\\;C:\\SeleniumWebDrivers\\ChromeDriver;C:\\Program Files (x86)\\sbt\\bin;C:\\Program Files (x86)\\GitHub CLI;C:\\Program Files\\Git\\bin;C:\\Program Files (x86)\\pipx_bin;C:\\npm\\prefix;C:\\hostedtoolcache\\windows\\go\\1.24.13\\x64\\bin;C:\\hostedtoolcache\\windows\\Python\\3.12.10\\x64\\Scripts;C:\\hostedtoolcache\\windows\\Python\\3.12.10\\x64;C:\\hostedtoolcache\\windows\\Ruby\\3.3.12\\x64\\bin;C:\\Program Files\\OpenSSL\\bin;C:\\tools\\kotlinc\\bin;C:\\hostedtoolcache\\windows\\Java_Temurin-Hotspot_jdk\\17.0.19-10\\x64\\bin;C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI;C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\wbin;C:\\ProgramData\\kind;C:\\ProgramData\\Chocolatey\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Windows\\System32\\OpenSSH\\;C:\\Program Files\\PowerShell\\7\\;C:\\Program Files\\Microsoft\\Web Platform Installer\\;C:\\Program Files\\Microsoft SQL Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files\\dotnet\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows Performance Toolkit\\;C:\\Program Files (x86)\\WiX Toolset v3.14\\bin;C:\\Program Files\\Microsoft SQL Server\\130\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\140\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\150\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\170\\DTS\\Binn\\;C:\\ProgramData\\chocolatey\\lib\\pulumi\\tools\\Pulumi\\bin;C:\\Program Files\\CMake\\bin;C:\\Strawberry\\c\\bin;C:\\Strawberry\\perl\\site\\bin;C:\\Strawberry\\perl\\bin;C:\\ProgramData\\chocolatey\\lib\\maven\\apache-maven-3.9.16\\bin;C:\\Program Files\\Microsoft Service Fabric\\bin\\Fabric\\Fabric.Code;C:\\Program Files\\Microsoft SDKs\\Service Fabric\\Tools\\ServiceFabricLocalClusterManager;C:\\Program Files\\nodejs\\;C:\\Program Files\\Git\\cmd;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\GitHub CLI\\;c:\\tools\\php;C:\\Program Files (x86)\\sbt\\bin;C:\\Program Files\\Amazon\\AWSCLIV2\\;C:\\Program Files\\Amazon\\SessionManagerPlugin\\bin\\;C:\\Program Files\\Amazon\\AWSSAMCLI\\bin\\;C:\\Program Files\\Microsoft SQL Server\\130\\Tools\\Binn\\;C:\\Program Files\\mongosh\\;C:\\Program Files\\LLVM\\bin;C:\\Program Files (x86)\\LLVM\\bin;C:\\Users\\runneradmin\\.dotnet\\tools;C:\\Users\\runneradmin\\.cargo\\bin;C:\\Users\\runneradmin\\AppData\\Local\\Microsoft\\WindowsApps","PATHEXT":".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL","PGBIN":"C:\\Program Files\\PostgreSQL\\17\\bin","PGDATA":"C:\\PostgreSQL\\17\\data","PGPASSWORD":"root","PGROOT":"C:\\Program Files\\PostgreSQL\\17","PGUSER":"postgres","PHPROOT":"c:\\tools\\php","PIPX_BIN_DIR":"C:\\Program Files (x86)\\pipx_bin","PIPX_HOME":"C:\\Program Files (x86)\\pipx","POWERSHELL_DISTRIBUTION_CHANNEL":"GitHub-Actions-win25-vs2026","POWERSHELL_UPDATECHECK":"Off","PROCESSOR_ARCHITECTURE":"AMD64","PROCESSOR_IDENTIFIER":"AMD64 Family 25 Model 1 Stepping 1, AuthenticAMD","PROCESSOR_LEVEL":"25","PROCESSOR_REVISION":"0101","ProgramData":"C:\\ProgramData","ProgramFiles":"C:\\Program Files","ProgramFiles(x86)":"C:\\Program Files (x86)","ProgramW6432":"C:\\Program Files","PROMPT":"$P$G","PSModuleAnalysisCachePath":"C:\\PSModuleAnalysisCachePath\\ModuleAnalysisCache","PSModulePath":"C:\\Users\\runneradmin\\Documents\\PowerShell\\Modules;C:\\Program Files\\PowerShell\\Modules;c:\\program files\\powershell\\7\\Modules;C:\\\\Modules\\az_15.6.1;C:\\Users\\packer\\Documents\\WindowsPowerShell\\Modules;C:\\Program Files\\WindowsPowerShell\\Modules;C:\\Windows\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program Files\\Microsoft SQL Server\\130\\Tools\\PowerShell\\Modules\\","PUBLIC":"C:\\Users\\Public","RTOOLS45_HOME":"C:\\rtools45","RUNNER_ARCH":"X64","RUNNER_ENVIRONMENT":"github-hosted","RUNNER_NAME":"GitHub Actions 1000000147","RUNNER_OS":"Windows","RUNNER_TEMP":"D:\\a\\_temp","RUNNER_TOOL_CACHE":"C:\\hostedtoolcache\\windows","RUNNER_TRACKING_ID":"github_ec6fd99f-f506-4b66-9051-1b19bd1e3208","RUNNER_WORKSPACE":"D:\\a\\fine-desktop","SBT_HOME":"C:\\Program Files (x86)\\sbt\\","SELENIUM_JAR_PATH":"C:\\selenium\\selenium-server.jar","SystemDrive":"C:","SystemRoot":"C:\\Windows","TEMP":"C:\\Users\\RUNNER~1\\AppData\\Local\\Temp","TMP":"C:\\Users\\RUNNER~1\\AppData\\Local\\Temp","USERDOMAIN":"runnervmhisb5","USERDOMAIN_ROAMINGPROFILE":"runnervmhisb5","USERNAME":"runneradmin","USERPROFILE":"C:\\Users\\runneradmin","VCPKG_INSTALLATION_ROOT":"C:\\vcpkg","windir":"C:\\Windows","WIX":"C:\\Program Files (x86)\\WiX Toolset v3.14\\","TERM":"dumb"},"shell":false}
npm error gyp sill find Python execFile result: err = null
npm error gyp sill find Python execFile result: stdout = "3.14.6\r\n"
npm error gyp sill find Python execFile result: stderr = ""
npm error gyp verb find Python - version is "3.14.6"
npm error gyp info find Python using Python version 3.14.6 found at "C:\hostedtoolcache\windows\Python\3.14.6\x64\python.exe"
npm error gyp verb get node dir no --target version specified, falling back to host node version: 22.23.1
npm error gyp verb install input version string "22.23.1"
npm error gyp verb install installing version: 22.23.1
npm error gyp verb install --ensure was passed, so won't reinstall if already installed
npm error gyp verb install version not already installed, continuing with install 22.23.1
npm error gyp verb ensuring devDir is created C:\Users\runneradmin\AppData\Local\node-gyp\Cache\22.23.1
npm error gyp verb created devDir \\?\C:\Users\runneradmin\AppData\Local\node-gyp
npm error gyp http GET https://nodejs.org/download/release/v22.23.1/node-v22.23.1-headers.tar.gz
npm error gyp http 200 https://nodejs.org/download/release/v22.23.1/node-v22.23.1-headers.tar.gz
npm error gyp sill ignoring from tarball node-v22.23.1/
npm error gyp sill ignoring from tarball node-v22.23.1/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-platform.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-local-handle.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-script.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-debug.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-value.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node_api.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/uv/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/posix.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/threadpool.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/win.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/bsd.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/sunos.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/aix.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/tree.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/os390.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/unix.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/linux.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/errno.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/darwin.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/uv/version.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-array-buffer.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/config.gypi
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/zlib.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-embedder-heap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/zconf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-locker.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-function-callback.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-cppgc.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-template.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-extension.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node_api_types.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-statistics.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-context.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-initialization.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/param_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/randerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ui_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ecdsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bnerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cryptoerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/e_ostime.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/safestack_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/uierr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/opensslconf_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/tls1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/param_build.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ocsp_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/srp_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core_names_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/evp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/opensslv_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core_dispatch.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ossl_typ.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dsaerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/whrlpool.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ess_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1t_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_vfy_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs7_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmp_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/srtp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs7_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crmf_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cms_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/lhash_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/httperr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_vfy_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/trace.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/types.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conftypes.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/objectserr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/decoder.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/buffererr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509v3err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conf_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/self_test.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/idea.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core_object.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/kdf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/encodererr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509v3_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ebcdic.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/md4.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ecerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cms_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmperr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crmferr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rand.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bn_conf_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ml_kem.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dh.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ocsp_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ssl3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/engineerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/byteorder.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/fipskey_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/thread.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/blowfish.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/aes.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conferr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509v3_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/txt_db.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/symhacks.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/storeerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/params.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ts.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/quic.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/camellia.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/macros.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmp_util.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cast.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ssl_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bn_conf_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/async.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/seed.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dso_conf_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pemerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/configuration_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/err_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asyncerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dherr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dso_conf_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pem.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ui_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs12_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_acert_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/buffer.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/sslerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ssl_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmac.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/prov_ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/provider.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crypto_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core_names_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/err_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/comperr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rc2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/hpke.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ct_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/opensslconf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/indicator.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conf_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs12_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ocsperr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/srp_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/md5.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/configuration_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ct_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/des.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1t_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs7err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/safestack_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/comp_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/sslerr_legacy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/mdc2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crypto_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cterr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/core.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ecdh.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rc4.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/kdferr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/fips_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pkcs12err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/fipskey_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/pem2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmp_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/stack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/esserr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/param_names_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/obj_mac.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/modes.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-x86_64-cc/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin-i386-cc/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-x86_64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64-ARM/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/aix64-gcc-as/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/BSD-x86_64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris64-x86_64-gcc/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN64A/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-aarch64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-s390x/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/VC-WIN32/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/solaris-x86-gcc/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-loongarch64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-riscv64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/darwin64-arm64-cc/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-elf/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux64-mips64/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux32-s390x/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-ppc64le/no-asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/asm_avx2/crypto/buildinf.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_rsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_digests.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_ecx.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_ml_dsa.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_sm2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_ec.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/providers/common/include/prov/der_slh_dsa.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/internal/param_names.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/crypto/bn_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/crypto/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/progs.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/cmp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/cms.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/ui.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/crmf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/ocsp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/opensslv.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/x509_acert.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/asn1t.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/comp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/pkcs7.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/configuration.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/crypto.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/fipskey.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/pkcs12.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/safestack.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/lhash.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/bio.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/x509.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/srp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/core_names.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/ssl.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/ct.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/x509v3.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/asn1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/include/openssl/ess.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/crypto/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/archs/linux-armv4/no-asm/crypto/buildinf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/engine.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/tserr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/hmac.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/proverr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bn.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1err.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/opensslv_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/e_os2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/http.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rsaerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_vfy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ess_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cmserr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/sha.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ssl2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/conf_api.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/objects.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/cryptoerr_legacy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bio_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/comp_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dso_conf.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/rc5.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ripemd.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/dtls1.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/md2.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/param_names_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/asn1_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/ess.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bioerr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/x509_acert_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/crmf_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/evperr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/decodererr.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/lhash_asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/store.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/encoder.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/openssl/bio_no-asm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-profiler.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-message.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/common.gypi
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-weak-callback-info.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-memory-span.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/cppgc/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/heap-handle.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/cppgc/internal/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/logging.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/api-constants.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/caged-heap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/base-page-handle.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/write-barrier.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/finalizer-trait.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/pointer-policies.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/atomic-entry-flag.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/name-trait.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/compiler-specific.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/persistent-node.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/caged-heap-local-data.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/gc-info.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/internal/member-storage.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/allocation.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/member.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/explicit-management.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/liveness-broker.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/type-traits.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/heap-statistics.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/common.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/process-heap-statistics.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/heap-consistency.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/platform.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/sentinel-pointer.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/custom-space.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/prefinalizer.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/object-size-trait.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/macros.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/garbage-collected.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/trace-trait.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/testing.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/cross-thread-persistent.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/heap-state.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/name-provider.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/persistent.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/source-location.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/visitor.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/ephemeron-pair.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/heap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/cppgc/default-platform.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-promise.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-internal.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-proxy.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-primitive-object.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/js_native_api_types.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-unwinder.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node_buffer.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-isolate.h
npm error gyp sill ignoring from tarball node-v22.23.1/include/node/libplatform/
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/libplatform/v8-tracing.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/libplatform/libplatform-export.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/libplatform/libplatform.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-traced-handle.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-object.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/js_native_api.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node_object_wrap.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-date.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-embedder-state-scope.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-microtask.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-snapshot.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-handle-base.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-typed-array.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-exception.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-callbacks.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-microtask-queue.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8config.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-container.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-regexp.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-function.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-source-location.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-json.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-forward.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-wasm.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-maybe.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-external.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-persistent-handle.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-primitive.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node_version.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/node.h
npm error gyp verb content checksum node-v22.23.1-headers.tar.gz caf38d839815df92000b41b756056f575140f38f1d8c0cbef97448c33eb7d7b2
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-data.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-version.h
npm error gyp verb extracted file from tarball node-v22.23.1/include/node/v8-value-serializer.h
npm error gyp verb tarball done parsing tarball
npm error gyp verb on Windows; need to download `node.lib`... 
npm error gyp verb x64 node.lib dir C:\Users\RUNNER~1\AppData\Local\Temp\node-gyp-tmp-adDdFJ\x64
npm error gyp verb x64 node.lib url https://nodejs.org/download/release/v22.23.1/win-x64/node.lib
npm error gyp verb check download content checksum, need to download `SHASUMS256.txt`... 
npm error gyp verb checksum url https://nodejs.org/download/release/v22.23.1/SHASUMS256.txt
npm error gyp http GET https://nodejs.org/download/release/v22.23.1/SHASUMS256.txt
npm error gyp verb streaming x64 node.lib to: C:\Users\RUNNER~1\AppData\Local\Temp\node-gyp-tmp-adDdFJ\x64\node.lib
npm error gyp http GET https://nodejs.org/download/release/v22.23.1/win-x64/node.lib
npm error gyp http 200 https://nodejs.org/download/release/v22.23.1/SHASUMS256.txt
npm error gyp verb checksum data {"node-v22.23.1-aix-ppc64.tar.gz":"afab071f771073235dc1191e2ed872505d7a08d23cdff5103c678f9ec2ba44f9","node-v22.23.1-arm64.msi":"c32a95033580ebd54d1e10ade9bab80945df1309e53fdb1f424e657ce7baf8ef","node-v22.23.1-darwin-arm64.tar.gz":"ef28d8fab2c0e4314522d4bb1b7173270aa3937e93b92cb7de79c112ac1fa953","node-v22.23.1-darwin-arm64.tar.xz":"fb526811860f81dcac7dd8b2b55eca4accfc5d61c3b7c2508f2639faee8a738d","node-v22.23.1-darwin-x64.tar.gz":"b8da981b8a0b1241b70249204916da76c63573ddf5814dbd2d1e41069105cb81","node-v22.23.1-darwin-x64.tar.xz":"efeec6641a2f15f5396d27cd0b32f5062d6689d1e9e5d89607d0b29bda890233","node-v22.23.1-headers.tar.gz":"caf38d839815df92000b41b756056f575140f38f1d8c0cbef97448c33eb7d7b2","node-v22.23.1-headers.tar.xz":"b4d28a1c11bf6f643597e09101980904390df9480d835e1f07cc0a20d41768dc","node-v22.23.1-linux-arm64.tar.gz":"543fa39e57d4c07855939459a323f4deb9a79dd1bb45e6e99458b0f2de10db8d","node-v22.23.1-linux-arm64.tar.xz":"0294e8b915ab75f92c7513d2fcb830ae06e10684e6c603e99a87dbf8835389c1","node-v22.23.1-linux-armv7l.tar.gz":"03c56ac0bd3ef3cce967c2f7b2f7ac2259a4ae7ceeaa661291aadf65729a8b53","node-v22.23.1-linux-armv7l.tar.xz":"c24dcdd3df032a34d1c858ddac9e514d3cac6fa655cc92cd4afe4e589c866a10","node-v22.23.1-linux-ppc64le.tar.gz":"75ba0ad4949cc90fe0cf5f1e0c28bb7e5d17c1edaecd35dbf01f5830f9b3b552","node-v22.23.1-linux-ppc64le.tar.xz":"a645bcb7bbc498d09ba9249b5c6414aa6d0a461d8854afc61e32096646ba5e66","node-v22.23.1-linux-s390x.tar.gz":"94c7c55553ad5520172f5bfbd143389eebd1e6a200a5e2d8d309e9ed73f370e5","node-v22.23.1-linux-s390x.tar.xz":"f16b5636ba925b462e627c5e0ef47de3255bf4a7b38d56db58e2cf165df19c3c","node-v22.23.1-linux-x64.tar.gz":"7a8cb04b4a1df4eaf432125324b81b29a088e73570a23259a8de1c65d07fc129","node-v22.23.1-linux-x64.tar.xz":"9749e988f437343b7fa832c69ded82a312e41a03116d766797ac14f6f9eee578","node-v22.23.1-win-arm64.7z":"6fa537484f545991961061112624ab9c40b2d5b78e7848c096adde40e0a248c4","node-v22.23.1-win-arm64.zip":"b470fdfe3502c05151656e06d495e3f47544f2ee8b1d9c8705090f2dd5996bd0","node-v22.23.1-win-x64.7z":"036de547d4bf8b916f25a41064baed7cd61f12ce7d8cfe283d12f91688b51cb9","node-v22.23.1-win-x64.zip":"7df0bc9375723f4a86b3aa1b7cc73342423d9677a8df4538aca31a049e309c29","node-v22.23.1-win-x86.7z":"6b757e4bc3d293fe926a1be2727ab02d7411b95ece6c94a60d1d5de2279e846f","node-v22.23.1-win-x86.zip":"e298b368aad86c571447a3650db3ce19063373ffd39d6d73d014a5d9ad31dc62","node-v22.23.1-x64.msi":"4e41d4fea6661eb330fa88b1cdce2ba5e6b07d93f689c9d549cb9dd09cb9b2b0","node-v22.23.1-x86.msi":"de75961b3162771f8f071608226fabc5029174c279a49c2b88621a8091acffa3","node-v22.23.1.pkg":"e22de03c865a06ac8f2714eab5110dbe71c70d635042c3e305e62dbba5792bd5","node-v22.23.1.tar.gz":"f40ff2e6b99196271caffae2b240e9148d66675994afd00e522dad7ecce6f27b","node-v22.23.1.tar.xz":"b27385d6845089bdb91285d94b06c2a5cf1c37f8173a3c4e10824cc1ffadeaba","win-arm64/node.exe":"f55db97c9924b0b37b05e8cf1be4e04c72aec01dc1c22420b5c31ab9cd118b89","win-arm64/node.lib":"e56e62f4a7ae6643a40db01f09072e8a93ccbe73be8abff927b793344691d6b7","win-arm64/node_pdb.7z":"9890235b52f0503986ee1690bf33217edbe888c1cb90f77e54169a0077161435","win-arm64/node_pdb.zip":"7a4e1f4cc45ed60a304c42d91bce5073743a13b62e5db1fb58370b73caf7f101","win-x64/node.exe":"f8d162c0641dcee512132f3bcf8a68169c7ecb852efd8e1a46c9fec5a0f469ed","win-x64/node.lib":"ac15f1e9d7c8279353723a77f6319967f1a41c06026521094a8234c2e6fbe052","win-x64/node_pdb.7z":"99ce2684f147d28d89b07bc4ed6d0c9112f3ed60ad8253267b0838cce3c4322e","win-x64/node_pdb.zip":"69e9012ec5474edb2d8643b944d067b4d2749d61c2e207beff95bc8edaa05d7d","win-x86/node.exe":"b1c3e891f327f59594345068505b052da6c93dbb19e5e5af631202eeb0c4015b","win-x86/node.lib":"66949ba371a159f5e3626f6ce960f85ab6bcdd237eafcdfbc11d1377a2767652","win-x86/node_pdb.7z":"174398659805e6e5e42855498386e1c2777b00351cb253b6b2938447ffcca299","win-x86/node_pdb.zip":"cbdc77eda7ac39ada59ca3505c50a43165904b23118fde06f79ab572f02a658e"}
npm error gyp http 200 https://nodejs.org/download/release/v22.23.1/win-x64/node.lib
npm error gyp verb content checksum win-x64/node.lib ac15f1e9d7c8279353723a77f6319967f1a41c06026521094a8234c2e6fbe052
npm error gyp verb download contents checksum {"node-v22.23.1-headers.tar.gz":"caf38d839815df92000b41b756056f575140f38f1d8c0cbef97448c33eb7d7b2","win-x64/node.lib":"ac15f1e9d7c8279353723a77f6319967f1a41c06026521094a8234c2e6fbe052"}
npm error gyp verb validating download checksum for node-v22.23.1-headers.tar.gz (caf38d839815df92000b41b756056f575140f38f1d8c0cbef97448c33eb7d7b2 == caf38d839815df92000b41b756056f575140f38f1d8c0cbef97448c33eb7d7b2)
npm error gyp verb validating download checksum for win-x64/node.lib (ac15f1e9d7c8279353723a77f6319967f1a41c06026521094a8234c2e6fbe052 == ac15f1e9d7c8279353723a77f6319967f1a41c06026521094a8234c2e6fbe052)
npm error gyp verb get node dir target node version installed: 22.23.1
npm error gyp verb build dir attempting to create "build" dir: D:\a\fine-desktop\fine-desktop\node_modules\better-sqlite3\build
npm error gyp verb build dir "build" dir needed to be created? Yes
npm error gyp verb find VS msvs_version not set from command line or npm config
npm error gyp verb find VS VCINSTALLDIR not set, not running in VS Command Prompt
npm error gyp sill find VS Running C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe [
npm error gyp sill find VS '-NoProfile',
npm error gyp sill find VS '-Command',
npm error gyp sill find VS '&{@(Get-Module -ListAvailable -Name VSSetup).Version.ToString()}'
npm error gyp sill find VS ]
npm error gyp sill find VS Running C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe [
npm error gyp sill find VS '-NoProfile',
npm error gyp sill find VS '-Command',
npm error gyp sill find VS '&{Get-VSSetupInstance  | ConvertTo-Json -Depth 3}'
npm error gyp sill find VS ]
npm error gyp sill find VS PS stderr = ""
npm error gyp sill find VS PS err = "RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stdout maxBuffer length exceeded\n    at Socket.onChildStdout (node:child_process:484:14)\n    at Socket.emit (node:events:519:28)\n    at addChunk (node:internal/streams/readable:561:12)\n    at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)\n    at Readable.push (node:internal/streams/readable:392:5)\n    at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)"
npm error gyp verb find VS could not use PowerShell to find Visual Studio 2017 or newer, try re-running with '--loglevel silly' for more details.
npm error gyp verb find VS 
npm error gyp verb find VS Failure details: RangeError [ERR_CHILD_PROCESS_STDIO_MAXB
npm error gyp sill find VS Running C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe [
npm error gyp sill find VS '-ExecutionPolicy',
npm error gyp sill find VS 'Unrestricted',
npm error gyp sill find VS '-NoProfile',
npm error gyp sill find VS '-Command',
npm error gyp sill find VS "&{Add-Type -Path 'D:\\a\\fine-desktop\\fine-desktop\\node_modules\\@electron\\node-gyp\\lib\\Find-VisualStudio.cs';[VisualStudioConfiguration.Main]::PrintJson()}"
npm error gyp sill find VS ]
npm error gyp sill find VS PS stderr = ""
npm error gyp sill find VS processing installation: "C:\Program Files\Microsoft Visual Studio\18\Enterprise"
npm error gyp sill find VS - version match = ["18.8.12023.21","18","8"]
npm error gyp sill find VS - unsupported version: 18
npm error gyp sill find VS - found VC.MSBuild.Base
npm error gyp sill find VS - found VC.Tools.x86.x64
npm error gyp sill find VS - invalid versionYear: undefined
npm error gyp sill find VS - found Win10/11SDK: 26100
npm error gyp sill find VS vsInfo: [
npm error gyp sill find VS {
npm error gyp sill find VS path: 'C:\\Program Files\\Microsoft Visual Studio\\18\\Enterprise',
npm error gyp sill find VS msBuild: 'C:\\Program Files\\Microsoft Visual Studio\\18\\Enterprise\\MSBuild\\Current\\Bin\\MSBuild.exe',
npm error gyp sill find VS toolset: null,
npm error gyp sill find VS sdk: '10.0.26100.0'
npm error gyp sill find VS }
npm error gyp sill find VS ]
npm error gyp verb find VS unknown version "undefined" found at "C:\Program Files\Microsoft Visual Studio\18\Enterprise"
npm error gyp verb find VS could not find a version of Visual Studio 2017 or newer to use
npm error gyp verb find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp verb find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp verb find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp verb find VS not looking for VS2015 as it is only supported up to Node.js 18
npm error gyp verb find VS not looking for VS2013 as it is only supported up to Node.js 8
npm error gyp ERR! find VS 
npm error gyp ERR! find VS msvs_version not set from command line or npm config
npm error gyp ERR! find VS VCINSTALLDIR not set, not running in VS Command Prompt
npm error gyp ERR! find VS could not use PowerShell to find Visual Studio 2017 or newer, try re-running with '--loglevel silly' for more details.
npm error gyp ERR! find VS 
npm error gyp ERR! find VS Failure details: RangeError [ERR_CHILD_PROCESS_STDIO_MAXB
npm error gyp ERR! find VS unknown version "undefined" found at "C:\Program Files\Microsoft Visual Studio\18\Enterprise"
npm error gyp ERR! find VS could not find a version of Visual Studio 2017 or newer to use
npm error gyp ERR! find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp ERR! find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp ERR! find VS not looking for VS2017 as it is only supported up to Node.js 21
npm error gyp ERR! find VS not looking for VS2015 as it is only supported up to Node.js 18
npm error gyp ERR! find VS not looking for VS2013 as it is only supported up to Node.js 8
npm error gyp ERR! find VS 
npm error gyp ERR! find VS **************************************************************
npm error gyp ERR! find VS You need to install the latest version of Visual Studio
npm error gyp ERR! find VS including the "Desktop development with C++" workload.
npm error gyp ERR! find VS For more information consult the documentation at:
npm error gyp ERR! find VS https://github.com/nodejs/node-gyp#on-windows
npm error gyp ERR! find VS **************************************************************
npm error gyp ERR! find VS 
npm error gyp ERR! configure error 
npm error gyp ERR! stack Error: Could not find any Visual Studio installation to use
npm error gyp ERR! stack at VisualStudioFinder.fail (D:\a\fine-desktop\fine-desktop\node_modules\@electron\node-gyp\lib\find-visualstudio.js:118:11)
npm error gyp ERR! stack at VisualStudioFinder.findVisualStudio (D:\a\fine-desktop\fine-desktop\node_modules\@electron\node-gyp\lib\find-visualstudio.js:74:17)
npm error gyp ERR! stack at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
npm error gyp ERR! stack at async createBuildDir (D:\a\fine-desktop\fine-desktop\node_modules\@electron\node-gyp\lib\configure.js:112:18)
npm error gyp ERR! stack at async run (D:\a\fine-desktop\fine-desktop\node_modules\@electron\node-gyp\bin\node-gyp.js:81:18)
npm error gyp ERR! System Windows_NT 10.0.26100
npm error gyp ERR! command "C:\\hostedtoolcache\\windows\\node\\22.23.1\\x64\\node.exe" "D:\\a\\fine-desktop\\fine-desktop\\node_modules\\@electron\\node-gyp\\bin\\node-gyp.js" "rebuild"
npm error gyp ERR! cwd D:\a\fine-desktop\fine-desktop\node_modules\better-sqlite3
npm error gyp ERR! node -v v22.23.1
npm error gyp ERR! node-gyp -v v10.2.0-electron.1
npm error gyp ERR! not ok
npm error A complete log of this run can be found in: C:\npm\cache\_logs\2026-08-01T15_53_39_882Z-debug-0.log