import React from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from '@material-ui/core/Tooltip';
import { useStyles } from './style';

const ChatCard = (props) => {
  const { chats } = props;
  const styles = useStyles();
  // console.log(chats)

  const renderChat = chats && chats.length 
  ? chats.map((item, index) => {
    return (
      <Grid key={`chat-${index}`}>
        <b>{item.sender}</b>
        {
          item.type === 2
          ? <Tooltip title={`Download ${item.filename}`}>
              <>
                <a download={item.filename} href={item.message}>
                  <GetAppIcon fontSize="large"/>
                </a>
                {item.filename}
              </>
            </Tooltip>
          : ' ' + item.message
        }
      </Grid>
    )
  })
  : (<p>Start the conversation</p>)

  return (
    <GridList
      className={styles.chatList}
      cols={1}
      cellHeight="auto"
    >
      {renderChat}
      <div id="chat-base"></div>
    </GridList>
  );
};

export default ChatCard;
