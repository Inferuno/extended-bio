data/
-----

JSON files holding the site's content.

Each file is fetched by script.js, which builds the elements from it. Nothing here is rendered directly.

What goes here:
  - projects.json    one object per project card
  - board.json       stats for the Board widgets

What does NOT go here:
  - images  ->  assets/brand/ or assets/projects/
  - anything that only appears once and never changes, those can stay in
    index.html