import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import ExtensionIcon from "@material-ui/icons/Extension";
import HomeIcon from "@material-ui/icons/Home";
import React from "react";
import { Link } from "react-router-dom";

class Navigation extends React.PureComponent {
  public render() {
    return (
      <List>
        <ListItem button={true} component={this.linkToHome} key="Home">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </ListItem>
        <ListItem button={true} component={this.linkToPlugins} key="Plugins">
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText>Plugins</ListItemText>
        </ListItem>
      </List>
    );
  }

  private linkToHome = (props: any) => {
    return <Link to="/" {...props} />;
  };

  private linkToPlugins = (props: any) => {
    return <Link to="/plugins" {...props} />;
  };
}

export default Navigation;
