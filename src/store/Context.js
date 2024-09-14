import React from 'react'

import discordImage from '../images/discord.webp'
import emailImage from '../images/email_256.webp'

import opensign_logo from '../images/opensign_logo_512.png'
import opensign_banner from '../images/digital_signature.jpg'

import opensign_one from '../images/opensign_one.webp'
import opensign_two from '../images/opensign_two.webp'
import opensign_three from '../images/opensign_three.webp'
import opensign_four from '../images/opensign_four.webp'
import opensign_five from '../images/opensign_five.webp'
import opensign_six from '../images/opensign_six.webp'

export const initialState = {
    // when in dev, change appURL to local url
    // appURL: 'http://localhost:3000',  
    // when in production, change appURL to real url
    // appURL: 'https://opensign.jomimi.com',

    appURL: process.env.REACT_APP_URI,

    appLogo: opensign_logo,
    appName: 'OpenSign',
    coverTitle: 'The Open-Source Solution for Digital Signatures',
    coverText: 'OpenSign is a powerful, open-source platform that delivers a seamless and secure solution for digital signatures. Built to give businesses, organizations, and individuals complete control over their document signing processes, OpenSign offers customizable workflows, robust data privacy, and easy integration with your existing systems—all at no cost. Empower your digital document management with OpenSign, and join the open-source movement today.',
    coverImage: opensign_banner,

    discordImage: discordImage,
    discordLink: 'https://discord.gg/AwRv3QZuKP',

    emailImage: emailImage,
    emailLink: 'mailto:contact@jomimi.com',

    signatureCanvasWidth: 500,
    signatureCanvasHeight: 200,
    signature: localStorage.getItem('signature') || '',
    printedName: localStorage.getItem('printedName') || '',
    nameInitials: localStorage.getItem('nameInitials') || '',


    mobileSignatureCanvasWidth: 400,
    mobileSignatureCanvasHeight: 200,
    mobileSignature: localStorage.getItem('mobileSignature') || '',
    mobilePrintedName: localStorage.getItem('mobilePrintedName') || '',
    mobileNameInitials: localStorage.getItem('mobileNameInitials') || '',

    mobileSegmentedValue: 'Text Box',

    sectionList: [
        {
            'title': `Seamless & Secure Digital Signatures`,
            'text': `OpenSign provides a powerful, open-source solution for your digital signature needs. From secure signing to robust data privacy, we offer the peace of mind you need for handling critical documents, all at no cost.`,
            'image': opensign_one,
        },
        {
            'title': `Take Control of Your Document Workflows`,
            'text': `With OpenSign, you’re in the driver’s seat. Customize your workflows, automate signature collection, and tailor the platform to meet your specific needs. OpenSign adapts to you, not the other way around.`,
            'image': opensign_two,
        },
        {
            'title': `Open-Source, Zero Cost`,
            'text': `Say goodbye to expensive licensing fees. OpenSign is a completely free, open-source platform that empowers businesses, organizations, and individuals to manage their digital documents without the hefty price tag.`,
            'image': opensign_three,
        },
        {
            'title': `Easy Integration with Existing Systems`,
            'text': `Whether you're working with CRMs, project management software, or other business tools, OpenSign integrates smoothly into your existing systems. Get started quickly and easily without disrupting your workflows.`,
            'image': opensign_four,
        },
        {
            'title': `Committed to Data Privacy`,
            'text': `Your privacy matters. OpenSign is built with data protection in mind, ensuring that your documents and signatures are securely handled every step of the way. Maintain full control over your sensitive information.`,
            'image': opensign_five,
        },
        {
            'title': `Join the Open-Source Movement`,
            'text': `Empower your digital signature processes while supporting the open-source community. OpenSign’s collaborative and transparent approach ensures constant improvements and innovation, driven by its user base.`,
            'image': opensign_six,
        },
    ],
}


const initialContext = {
    state: initialState,
    dispatch: () => null,
}

export const Context = React.createContext(initialContext)
