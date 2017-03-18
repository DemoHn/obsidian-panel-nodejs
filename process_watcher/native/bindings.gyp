{
  "targets": [
    {
      "target_name": "process_watcher",
      "sources": [ "process_watcher.cc" ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
