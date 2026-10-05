# usage: asc-upload-preview.rb <video> <PREVIEW_TYPE> <bundle-id> <version> [poster-frame HH:MM:SS:FF]
require "spaceship"
require "json"
video, preview_type, bundle_id, version, poster = ARGV
abort "usage: asc-upload-preview.rb <video> <PREVIEW_TYPE> <bundle-id> <version> [poster-frame]" unless video && preview_type && bundle_id && version
poster ||= "00:00:05:00"
cfg = JSON.parse(File.read("asc_api_key.json"))
Spaceship::ConnectAPI.token = Spaceship::ConnectAPI::Token.create(key_id: cfg["key_id"], issuer_id: cfg["issuer_id"], filepath: File.expand_path(cfg["key_filepath"] || "AuthKey_#{cfg['key_id']}.p8"))
app = Spaceship::ConnectAPI::App.find(bundle_id)
puts "primary locale #{app.primary_locale}"
%w[IOS MAC_OS].each do |p|
  plat = Spaceship::ConnectAPI::Platform.const_get(p)
  app.ensure_version!(version, platform: plat)
  v = app.get_edit_app_store_version(platform: plat)
  puts "#{p}: #{v.version_string} #{v.app_store_state}"
end
v = app.get_edit_app_store_version(platform: Spaceship::ConnectAPI::Platform::IOS)
loc = v.get_app_store_version_localizations.find { |l| l.locale == app.primary_locale }
set = loc.get_app_preview_sets.find { |s| s.preview_type == preview_type } || loc.create_app_preview_set(attributes: { previewType: preview_type })
puts "set #{set.preview_type} has #{(set.app_previews || []).size} previews; uploading"
set.upload_preview(path: video, wait_for_processing: false, frame_time_code: poster)
set = Spaceship::ConnectAPI::AppPreviewSet.get(app_preview_set_id: set.id)
puts "now #{(set.app_previews || []).size} preview(s) in #{loc.locale} #{set.preview_type}"
