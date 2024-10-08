import './App.css'

import { BrowserRouter, useRoutes } from 'react-router-dom'

import Desktop from './Desktop'
import Mobile from './Mobile'

import DesktopPaper from './DesktopPaper'
import MobilePaper from './MobilePaper'

import {
  useReducer,
} from 'react'

import {
  Context,
  initialState,
} from './store/Context'

import {
  reducer,
} from './store/reducer'

function RouteElementsDesktop() {
  const routeElements = useRoutes([
    { path: '/', element: <Desktop /> },
    { path: '/paper', element: <DesktopPaper /> },
  ]);
  return routeElements
}

function RouteElementsMobile() {
  const routeElements = useRoutes([
    { path: '/', element: <Mobile /> },
    { path: '/paper', element: <MobilePaper /> },
  ]);
  return routeElements
}

function DesktopApp() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = {state, dispatch}
  
  return (
    <Context.Provider value={value}>
      <BrowserRouter>
        <RouteElementsDesktop />
      </BrowserRouter>
    </Context.Provider>
  )
}

function MobileApp() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = {state, dispatch}

  return (
    <Context.Provider value={value}>
      <BrowserRouter>
        <RouteElementsMobile />
      </BrowserRouter>
    </Context.Provider>
  )
}

function App() {
  function isDesktop() {
    return 850 < window.innerWidth
  }

  return (
    <>
    {
      isDesktop() ? <DesktopApp /> : <MobileApp />
    }
    </>
  )
}

export default App
