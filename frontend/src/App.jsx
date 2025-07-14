
import URLPage from './pages/URLPage'
import UrlShortnerPage from './pages/UrlShortnerPage'
import {Route , Routes} from 'react-router-dom'
import Homepage from './pages/HomePage'
function App() {


  return (
    <>
    <Routes>

      <Route path= '/' element= {<Homepage/>}/>
       <Route path='/shorten' element={<UrlShortnerPage/>}/>
      <Route path='/urls' element={<URLPage/>}/>
    
    </Routes>
    </>
  )
}

export default App
