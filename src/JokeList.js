import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
  state = {
    jokes: [],
    numJokesToGet: 10,
  };

  async componentDidMount() {
    await this.getJokes();
  }

  /* get jokes if there are no jokes */

  async getJokes() {
    let j = [...this.state.jokes];
    let seenJokes = new Set();
    try {
      while (j.length < this.state.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0, locked: false });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ ...this.state, jokes: j });
    } catch (e) {
      console.log(e);
    }
  }

  /* empty joke list and then call getJokes */

  generateNewJokes = async () => {
    const saveList = this.state.jokes.filter((j) => j.locked);
    this.setState({ ...this.state, jokes: saveList }, await this.getJokes());
    await this.getJokes();
  };

  /* change vote for this id by delta (+1 or -1) */

  vote = (id, delta) => {
    let updatedList = this.state.jokes.map((j) =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    );
    this.setState({ ...this.state, jokes: updatedList });
  };

  /* toggle lock status for joke (locked jokes are saved on the next load) */

  toggleLock = (id) => {
    let updatedList = this.state.jokes.map((j) =>
      j.id === id ? { ...j, locked: !j.locked } : j
    );
    this.setState({ ...this.state, jokes: updatedList });
  };

  /* render: either loading spinner or list of sorted jokes. */

  render() {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map((j) => (
            <Joke
              text={j.joke}
              key={j.id}
              id={j.id}
              votes={j.votes}
              locked={j.locked}
              vote={this.vote}
              toggleLock={this.toggleLock}
            />
          ))}
        </div>
      );
    }

    return <h1>...loading jokes...</h1>;
  }
}

export default JokeList;
