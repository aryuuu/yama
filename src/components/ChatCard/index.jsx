import React from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';

const ChatCard = (props) => {
  const { chats } = props;

  const renderChat = chats.map((item, index) => {
    return (
      <Grid key={`chat-${index}`}>
        {item}
      </Grid>
    )
  })

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
