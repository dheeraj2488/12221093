
import URLPage from './pages/URLPage'
import UrlShortnerPage from './pages/UrlShortnerPage'
import {Route , Routes} from 'react-router-dom'
function App() {


  return (
    <>
    <Routes>
      <Route path='/' element={<UrlShortnerPage/>}/>
      <Route path='/urls' element={<URLPage/>}/>
    
    </Routes>
    </>
  )
}

export default App
