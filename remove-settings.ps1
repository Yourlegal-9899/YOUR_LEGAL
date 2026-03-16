$file = "c:\Users\honey\Downloads\COPY_LEGAL\copy-yourlegal-main\frontend\src\components\admin\admin-flow.tsx"
$content = Get-Content $file -Raw

# Remove from AdminView type
$content = $content -replace '  \| "settings"\r?\n', ''

# Remove from viewMeta
$content = $content -replace '  settings: \{ title: "Settings", subtitle: "Stripe, email, currency, tax and country settings" \},\r?\n', ''

# Remove from navItems
$content = $content -replace '  \{ key: "settings", label: "Settings", icon: Settings \},\r?\n', ''

# Remove from viewHref
$content = $content -replace '  settings: "/admin/settings",\r?\n', ''

# Remove from isAdminLoading switch
$content = $content -replace '      case "settings":\r?\n        return settingsLoading;\r?\n', ''

# Remove from view rendering
$content = $content -replace '            \{activeView === "settings" \? <SettingsView ctx=\{viewCtx\} /> : null\}\r?\n', ''

Set-Content $file $content
