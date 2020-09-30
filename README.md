# MMM-HLTV

This is a maintained fork from [maartenpaauw](https://github.com/maartenpaauw/MMM-HLTV.git)

> MagicMirror² module which will show CS:GO matches provided by HLTV

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) which displays the current and upcoming Counter-Strike: Global Offensive matches.

## View scoreboard and result
<p float="left">
  <img src="docs/scoreboard.png" width="40%" />
  <img src="docs/result.png" width="45%" /> 
</p>

## Installation

To install the module, use your terminal to:

1. Navigate to your MagicMirror's modules folder. If you are using the default installation directory, use the command: `cd ~/MagicMirror/modules`.
2. Copy the module to your computer by executing the following command: `git clone https://github.com/helpi90/MMM-HLTV.git`.
3. Navigate to the MMM-HLTV module directory with `cd MMM-HLTV`.
4. Install hltv with `npm i hltv && npm install`

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-HLTV',
            header: "Counter-Strike: Global Offensive",
            config: {
                'onlyTeam': '',
                'onlyEvent': '',
                'switchView': false,
            },
        },
    ],
}
```

## Configuration options

| Option           | Description                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `updateInterval` | *Optional* The update interval in milliseconds <br><br>**Type:** `int` <br>**Default:** 60000 (1 minute)         |
| `amount`         | *Optional* The amount of matches to show <br><br>**Type:** `int` <br>**Default:** 5                              |
| `stars`          | *Optional* The minimum number of stars a match must have <br><br>**Type:** `int` <br>**Default:** 0              |
| `preferWhite`    | *Optional* Whether the module may use colors <br><br>**Type:** `bool` <br>**Default:** false                     |
| `showLogos`      | *Optional* whether the logos of the teams may be displayed <br><br>**Type:** `bool` <br>**Default:** true        |
| `onlyTeam`      | *Optional* Only show team. Supports multiple strings, separated by comma (",")<br><br>**Type:** `string` <br>**Default:** ' '        |
| `onlyEvent`      | *Optional* Only show Event. Supports multiple strings, separated by comma (",")<br><br>**Type:** `string` <br>**Default:** ' '        |
| `switchView`     | *Optional* rotate view (matches/results) <br><br>**Type:** `bool` <br>**Default:** false        |

## Built With

- [HLTV](https://github.com/gigobyte/HLTV) - HLTV API wrapper.

## Authors

- **Helpi** - *Initial work* - [Helpi90](https://github.com/helpi90)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details
