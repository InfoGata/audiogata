import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { AppState } from "../store/store";
import BlockstackSync from "../syncs/BlockstackSync";
import { setTracks } from "../store/actions/song";

interface IProps extends StateProps, DispatchProps {}
const sync = new BlockstackSync();
const Sync = (props: IProps) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  React.useEffect(() => {
    sync.init().then(() => {
      setIsLoggedIn(sync.isLoggedIn());
    });
  }, []);

  function signIn() {
    sync.login();
  }

  function signOut() {
    sync.logout();
  }

  async function getData() {
    const data = await sync.getData();
    props.setTracks(data);
  }

  async function syncData() {
    await sync.sync(props.songs);
  }

  return isLoggedIn ? (
    <div>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={syncData}>Sync Data</button>
      <button onClick={getData}>Get Data</button>
    </div>
  ) : (
    <button onClick={signIn}>Sign In</button>
  );
};

const mapStateToProps = (state: AppState) => ({
  songs: state.song.songs,
});
type StateProps = ReturnType<typeof mapStateToProps>;
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setTracks,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sync);
export default connectedComponent;
