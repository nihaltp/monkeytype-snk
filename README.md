# snk - Monkeytype Edition

Generates a snake game from a monkeytype user contributions graph

Pull a monkeytype user's contribution graph.
Make it a snake Game, generate a snake path where the cells get eaten in an orderly fashion.

## Usage

### **github action**

```yaml
- uses: ./
  with:
    # monkeytype user name to read the contribution graph from (**required**)
    monkeytype_user_name: your_monkeytype_username

    # list of files to generate.
    # one file per line. Each output can be customized with options as query string.
    outputs: |
      dist/github-snake.svg
      dist/github-snake-dark.svg?palette=github-dark
      dist/ocean.gif?color_snake=orange&color_dots=#bfd6f6,#8dbdff,#64a1f4,#4b91f1,#3c7dd9&color_background=#aaaaaa
```

### **local**

```sh
npm install

npm run build:action
```

## Implementation

[solver algorithm](./packages/solver/README.md)
