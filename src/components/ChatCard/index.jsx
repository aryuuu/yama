import React from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';

const ChatCard = (props) => {
  const { chats } = props;
  // console.log(chats)

  const renderChat = chats && chats.length 
  ? chats.map((item, index) => {
    return (
      <Grid key={`chat-${index}`}>
        <b>{item.sender}</b> {item.message}
      </Grid>
    )
  })
  : (<p>Start the conversation</p>)

  return (
    <GridList
      cols={1}
      cellHeight="auto"
    >
      {renderChat}
      <div id="chat-base"></div>
    </GridList>
  );
};

export default ChatCard;
