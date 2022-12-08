import './App.css';
import Sidebar from './Components/Sidebar/Sidebar';
import Feed from './Components/Feed/Feed';

function Homepage() {
  return (
    <div className="app">
      <Sidebar />
      
      <Feed />

      
    </div>
  );
}

export default Homepage;
