import React, { Component } from "react";

import "./App.css";
import NavBar from "./components/navBar";
import SideBar from "./components/sidebar";

class App extends Component {
  state = {
    sidebar_open: true
  };

  handleSideBar = () => {
    this.setState({
      sidebar_open: !this.state.sidebar_open
    });
  };

  render() {
    return (
      <React.Fragment>
        <NavBar onBurger={this.handleSideBar} />
        <SideBar open={this.state.sidebar_open} />
      </React.Fragment>
    );
  }
}

export default App;
