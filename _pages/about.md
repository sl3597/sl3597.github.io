# Welcome to Jekyll!
#
# This config file is meant for settings that affect your whole blog, values
# which you are expected to set up once and rarely edit after that.
# For technical reasons, this file is *NOT* reloaded automatically when you use
# 'bundle exec jekyll serve'. If you change this file, please restart the server process.

# Site Settings
locale: "en-US"
title: "Shengwei Liu"
title_separator: "-"
name: "Shengwei Liu"
description: "Academic website of Shengwei Liu, MEng student at Cornell Tech."
url: "https://[YOUR-GITHUB-USERNAME].github.io" # UPDATE THIS TO YOUR REPO URL
baseurl: "" # the subpath of your site, e.g. /blog
repository: "[YOUR-GITHUB-USERNAME]/[YOUR-GITHUB-USERNAME].github.io" # UPDATE THIS

# User Settings
author:
  name: "Shengwei Liu"
  avatar: "profile.png" # Upload a photo named profile.png to your /images/ folder, or change this path
  bio: "MEng Student at **Cornell Tech**.<br>Researching Computer Architecture & ML Systems."
  location: "New York, NY"
  email: "sl3597@cornell.edu"
  linkedin: "shengweil27"
  googlescholar: # Add your ID if you have one
  github: # Add your GitHub username if you have one

# Build settings
markdown: kramdown
highlighter: rouge
permalink: /:categories/:title/
excerpt_separator: "\n\n"

# Theme Settings
minimal_mistakes_skin: "default" # "air", "aqua", "contrast", "dark", "dirt", "neon", "mint", "plum", "sunrise"

# Navigation settings (Keep defaults or customize)
sidebar:
  nav: "docs"

defaults:
  - scope:
      path: ""
      type: "pages"
    values:
      layout: "single"
      author_profile: true

  - scope:
      path: ""
      type: "posts"
    values:
      layout: "single"
      author_profile: true
      read_time: true
      comments: true
      share: true
      related: true

  - scope:
      path: "_publications"
    values:
      layout: "single"
      author_profile: true
      share: true
      comments: true

  - scope:
      path: "_talks"
    values:
      layout: "talk"
      author_profile: true
      share: true

  - scope:
      path: "_teaching"
    values:
      layout: "single"
      author_profile: true
      share: true

# Plugins
plugins:
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-gist
  - jekyll-feed
  - jemoji
  - jekyll-include-cache

author_profile: true
