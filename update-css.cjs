const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/background: linear-gradient\([\s\S]*?\);/, `background: linear-gradient(
    135deg,
    #ff9a9e 0%,
    #fecfef 25%,
    #a1c4fd 50%,
    #c2e9fb 75%,
    #ff9a9e 100%
  );`);

fs.writeFileSync('src/index.css', css);
