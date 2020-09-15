const NodeHelper = require('node_helper');
const _ = require('lodash');
const { HLTV } = require('hltv');

module.exports = NodeHelper.create({

    // Module config.
    config: [],

    // Matches
    matches: [],

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
        }

    },

    /**
     * Get all matches from HLTV and notify the module.
     * 
     * @return {void}
     */
    async getMatchesAndNotify() {
        this.matches = await HLTV.getMatches();
        this.applyfilters();
        this.connectToScorebots();
        this.sendSocketNotification('MATCHES_RECEIVED', this.matches);
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
    applyfilters () {
        this.filterTeams();
        this.filterEvents();
        this.filterStars();
        this.filterAmount();
    },

    /**
     * Show the first X matches based on amount.
     * 
     * @return {void}
     */
    filterAmount () {
        this.matches = this.matches.slice(0, this.config.amount);
    },

    /**
     * Show only event from config
     * 
     * @return {void}
     */
    filterEvents () {
        if (this.config.onlyEvent !== '') {
            let filteredMatches = [];
            let events = this.config.onlyEvent.split(",");
            this.matches.forEach(match => {
                if (match.event !== undefined) {
                    events.forEach(event => {
                        let eSplit = event.split(" ");
                        let found = true;
                        for (let i = 0; i < e.length; i++) {
                            if (match.event.name.toLowerCase().includes(eSplit[i].toLowerCase())) {
                                found = true;
                            }
                            else {
                                found = false;
                                break;
                            }
                        }
                        if (found === true) {
                            filteredMatches.push(match);
                        }
                    });
                }
            });
            this.matches = filteredMatches;
        }
    },

    /**
     * Show only teams from config
     * 
     * @return {void}
     */
    filterTeams () {
        if (this.config.onlyTeam !== '') {
            let filteredMatches = [];
            let teams = this.config.onlyTeam.split(",");
            this.matches.forEach(match => {
                if (match.team1 !== undefined) {
                    teams.forEach(team => {
                        if(match.team1.name.toLowerCase().includes(team.toLowerCase()) 
                        || match.team2.name.toLowerCase().includes(team.toLowerCase())) {
                            filteredMatches.push(match);
                        }
                    });
                }
            });
            this.matches = filteredMatches;
        }
    },

    /**
     * Only allow matches with enough stars.
     * 
     * @return {void}
     */
    filterStars () {
        this.matches = this.matches.filter(match => {
            return match.stars >= this.config.stars;
        });
    }
});
