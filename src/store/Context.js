import React from 'react'

import realkit_logo from '../images/realkit_logo.webp'
import realkit_banner from '../images/realkit_banner.png'

import discordImage from '../images/discord.webp'
import emailImage from '../images/email_256.webp'

export const initialState = {
    // when in dev, change appURL to local url
    // appURL: 'http://localhost:3000',  
    // when in production, change appURL to real url
    // appURL: 'https://opensign.jomimi.com',

    appURL: process.env.REACT_APP_URI,

    appLogo: realkit_logo,
    appName: 'OpenSign',
    coverTitle: 'The Open-Source Solution for Digital Signatures',
    coverText: 'OpenSign is a powerful, open-source platform that delivers a seamless and secure solution for digital signatures. Built to give businesses, organizations, and individuals complete control over their document signing processes, OpenSign offers customizable workflows, robust data privacy, and easy integration with your existing systems—all at no cost. Empower your digital document management with OpenSign, and join the open-source movement today.',
    coverImage: realkit_banner,

    discordImage: discordImage,
    discordLink: 'https://discord.gg/AwRv3QZuKP',

    emailImage: emailImage,
    emailLink: 'mailto:contact@jomimi.com',
}


const initialContext = {
    state: initialState,
    dispatch: () => null,
}

export const Context = React.createContext(initialContext)
