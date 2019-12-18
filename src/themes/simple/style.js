//the default locked UI style

exports.container = {
  position: 'relative',
  display: 'flex',
  height: 'calc(100vh - 42px)',
  marginTop: '42px',
  overflowX: 'hidden'
};

exports.menuContainer = {
  flex: '0 0 280px',
  overflowY:'auto',
  overflowX:'hidden',
  userSelect:'none',
  background:'linear-gradient(to bottom right, #5D5A58, #4C4A48)',
};

exports.contentContainer = {
  flex: 'auto',
  overflow: 'auto',
  overflowX: 'hidden'
};
