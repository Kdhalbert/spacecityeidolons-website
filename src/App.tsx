import './App.css'

function App() {
  return (
    <div className="app">
      <div className="container">
        <img src="/logo.svg" alt="Space City Eidolons" className="logo" />
        <h1>Space City Eidolons</h1>
        <p className="tagline">A Gaming Community</p>
        
        <div className="status">
          <h2>Coming Soon</h2>
          <p>Our website is under construction. In the meantime, join us on our community chat!</p>
        </div>
        
        <a href="https://chat.spacecityeidolons.com" className="chat-link">
          Join Our Chat
        </a>
      </div>
      
      <footer>
        &copy; 2026 Space City Eidolons
      </footer>
    </div>
  )
}

export default App
