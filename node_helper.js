const NodeHelper = require('node_helper');
const _ = require('lodash');
const { HLTV } = require('hltv');

module.exports = NodeHelper.create({

    // Module config.
    config: [],

    // Matches
    matches: [],

    // Results
    results: [],

    // Monitored scorebots.
    scorebots: [],

    /**
     * Socket notification is received from the module.
     * 
     * @param  {string} notification notification key
     * @param  {mixed}  payload      notification payload
     * @return {void}
     */
    socketNotificationReceived(notification, payload) {
        switch(notification) {
            case 'CONFIG_SET':
                this.config = payload;
                break;
            case 'MATCHES_FETCH':
                this.getMatchesAndNotify();
                break;
            case 'RESULTS_FETCH':
                this.getResults();
                break;
        }

    },

    /**
     * Get all matches from HLTV and notify the module.
     * 
     * @return {void}
     */
    async getMatchesAndNotify() {
        this.matches = await HLTV.getMatches();
        this.applyfilters("matches");
        this.connectToScorebots();
        this.sendSocketNotification('MATCHES_RECEIVED', this.matches);
    },

    async getResults() {
        this.results = await HLTV.getResults({pages: 2});
        this.applyfilters("results");
        this.connectToScorebots();
        this.sendSocketNotification('RESULTS_RECEIVED', this.results);
    },

    /**
     * Get the current score for each live match.
     * 
     * @return {void}
     */
     connectToScorebots() {
        this.matches.filter(match => {
            return match.live;
        }).forEach(match => {
            const id = match.id;
            if(! _.includes(this.scorebots, id)) {
                HLTV.connectToScorebot({
                    id,
                    onScoreboardUpdate: (scoreboard) => {
                        this.sendSocketNotification('MATCH_UPDATE', {
                            id,
                            scoreboard,
                        });
                    },
                    onConnect: () => {
                        this.scorebots.push(id);
                    },
                    onDisconnect: () => {
                        this.scorebots = _.remove(this.scorebots, _id => id === _id);
                        this.sendSocketNotification('MATCH_ENDED', id);
                    }
                });
            }
        });
    },

    /**
     * Apply all config filters.
     * 
     * @return {void}
     */
    applyfilters (typ) {
        this.filterTeams(typ);
        this.filterEvents(typ);
        this.filterStars(typ);
        this.filterAmount(typ);
    },

    /**
     * Show the first X matches based on amount.
     * 
     * @return {void}
     */
    filterAmount (typ) {
        if (typ === "matches") {
            this.matches = this.matches.slice(0, this.config.amount);
        } else if (typ === "results"){
            this.results = this.results.slice(0, this.config.amount);
        }
    },

    /**
     * Show only event from config
     * 
     * @return {void}
     */
    filterEvents (typ) {
        if (this.config.onlyEvent !== '') {
            let filteredList = [];
            let events = this.config.onlyEvent.split(",");
            let list = null;
            if (typ === "matches") {
                list = this.matches;
            }else if(typ === "results") {
                list = this.results;
            }else {
                return;
            }
            list.forEach(match => {
                if (match.event !== undefined) {
                    events.forEach(event => {
                        let eSplit = event.split(" ");
                        let found = true;
                        for (let i = 0; i < eSplit.length; i++) {
                            if (match.event.name.toLowerCase().includes(eSplit[i].toLowerCase())) {
                                found = true;
                            }
                            else {
                                found = false;
                                break;
                            }
                        }
                        if (found === true) {
                            filteredList.push(match);
                        }
                    });
                }
            });
            if (typ === "matches") {
                this.matches = filteredList;
            }else if(typ === "results") {
                this.results = filteredList
            }
        }
    },

    /**
     * Show only teams from config
     * 
     * @return {void}
     */
    filterTeams (typ) {
        if (this.config.onlyTeam !== '') {
            let filteredList = [];
            let teams = this.config.onlyTeam.split(",");
            let list = null;
            if (typ === "matches") {
                list = this.matches;
            }else if(typ === "results") {
                list = this.results;
            }else {
                return;
            }
            list.forEach(match => {
                if (match.team1 !== undefined) {
                    teams.forEach(team => {
                        if(match.team1.name.toLowerCase().includes(team.toLowerCase()) 
                        || match.team2.name.toLowerCase().includes(team.toLowerCase())) {
                            filteredList.push(match);
                        }
                    });
                }
            });
            if (typ === "matches") {
                this.matches = filteredList;
            }else if(typ === "results") {
                this.results = filteredList
            }
        }
    },

    /**
     * Only allow matches with enough stars.
     * 
     * @return {void}
     */
    filterStars (typ) {
        if (typ === "matches") {
            this.matches = this.matches.filter(match => {
                return match.stars >= this.config.stars;
            });
        } else if(typ === "results") {
            this.results = this.results.filter(match => {
                return match.stars >= this.config.stars;
            });
        }
    }
});
