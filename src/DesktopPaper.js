import {
    Typography,
    Layout,
    Row,
    Col,
    Affix,
    Image,
    Button,
    Tooltip,
    Popover,
    Divider,
    Input,
    Space,
    Progress,
    Segmented,
    Modal,
    Upload,
} from 'antd'

import {
    DownloadOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    EditOutlined,
    HomeOutlined,
    DeleteOutlined,
    UploadOutlined,
} from '@ant-design/icons'

import {
    useContext,
    useState,
    useEffect,
    useRef,
    useMemo,
} from 'react'

import { Context } from './store/Context'

import { useNavigate, useParams } from 'react-router-dom'
import DesktopHeader from './DesktopHeader'

import Draggable from 'react-draggable'


import html2canvas from 'html2canvas'

import jsPDF from 'jspdf'

import SignatureCanvas from 'react-signature-canvas'

import {
    Rnd,
} from 'react-rnd'

import * as PDFJS from 'pdfjs-dist/webpack'

function DraggableImage(props) {
    const [content, setContent] = useState(props.content || '')
    const [x, setX] = useState(props.x || 0)
    const [y, setY] = useState(props.y || 0)


    const [isFocused, setIsFocused] = useState(false)

    const [width, setWidth] = useState(props.width || 500)
    const [height, setHeight] = useState(props.height || 200)

    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)

    const updateXY = props.updateXY
    const updateWidthHeight = props.updateWidthHeight
    const deleteItem = props.deleteItem

    return (
            <Space.Compact
                style={{'display': 'flex', 'position': 'fixed'}}                      
                onMouseEnter={() => {
                    setIsFocused(true)
                }}
                onMouseLeave={() => {
                    setIsFocused(false)
                }}
            >
                <Rnd
                    size={{width: width, height: height}}
                    position={{x: x, y: y}} 
                    onDragStop={(e, data) => {
                        setX(data['lastX'])
                        setY(data['lastY'])
                        updateXY(data['lastX'], data['lastY'])
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        setWidth(ref.style.width)
                        setHeight(ref.style.height)
                        updateWidthHeight(ref.style.width, ref.style.height)
                    }}
                >

                    <Image preview={false} src={content} 
                        style={{
                            'width': '100%', 
                            'height': '100%', 
                            'border': isFocused? '2px dashed gray' : undefined,
                        }} 
                    />

                    <Button 
                        danger={isDeleteConfirmVisible? true : false} 
                        type={isDeleteConfirmVisible? 'primary': 'default'}
                        size='small' 
                        icon={<CloseOutlined />} 
                        onClick={() => {
                            if (isDeleteConfirmVisible) {
                                setIsDeleteConfirmVisible(false)
                                setIsFocused(false)
                                
                                deleteItem()
                            } else {
                                setIsDeleteConfirmVisible(true)
                                setTimeout(() => {
                                    setIsDeleteConfirmVisible(false)
                                }, 2000)
                            }
                        }}
                        style={{'visibility': isFocused? 'visible': 'hidden', 'position': 'absolute'}}
                    />
                </Rnd>
            
                
            </Space.Compact>


    )
}
function DraggableText(props) {
    const [content, setContent] = useState(props.content || '')
    const [x, setX] = useState(props.x || 0)
    const [y, setY] = useState(props.y || 0)


    const contentWidth = useMemo(() => {
        return (content.length * 10) + 'px'
    }, [content])

    const [isFocused, setIsFocused] = useState(false)


    const inputRef = useRef(null)

    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)

    const updateContent = props.updateContent
    const updateXY = props.updateXY
    const deleteItem = props.deleteItem

    return (
        <Draggable
            position={{x: x, y: y}} 
            onStop={(e, data) => {
                setX(data['lastX'])
                setY(data['lastY'])
                updateXY(data['lastX'], data['lastY'])
            }}                     
        >
            <Row justify='start'>
                <Space.Compact
                    onMouseEnter={() => {
                        setIsFocused(true)
                        inputRef.current?.focus({
                            cursor: 'end',
                        })
                    }}
                    onMouseLeave={() => {
                        setIsFocused(false)
                        inputRef.current?.blur()
                    }}
                    style={{'display': 'flex', 'position': 'fixed'}} 
                >
                    <Input
                        ref={inputRef}
                        variant={isFocused? 'outlined' : 'borderless'}
                        size='small' 
                        placeholder='text box' 
                        style={{
                            'width': contentWidth, 
                            'minWidth': '100px', 
                            'backgroundColor': isFocused ? 'white' : content === ''? 'mistyRose' : 'rgba(0,0,0,0)',
                            'color': 'blue',
                        }} 
                        value={content} 
                        onChange={(e) => {
                            setContent(e.target.value)
                            updateContent(e.target.value)
                        }}
                        onPressEnter={() => {
                            setIsFocused(false)
                        }}
                    />

                    <Button 
                        danger={isDeleteConfirmVisible? true : false} 
                        type={isDeleteConfirmVisible? 'primary': 'default'}
                        size='small' 
                        icon={<CloseOutlined />} 
                        onClick={() => {
                            if (isDeleteConfirmVisible) {
                                setIsDeleteConfirmVisible(false)

                                setIsFocused(false)
                                
                                deleteItem()
                            } else {
                                setIsDeleteConfirmVisible(true)
                                setTimeout(() => {
                                    setIsDeleteConfirmVisible(false)
                                }, 2000)
                            }
                        }}
                        style={{'visibility': isFocused? 'visible': 'hidden'}}
                    />
                </Space.Compact>
            </Row>
        </Draggable>
    )
}

function DesktopPaper() {
    const {state, dispatch} = useContext(Context)
    const navigate = useNavigate()


    const { paperName, paperPage } = useParams() // only activated once

    const [imagePageNumber, setImagePageNumber] = useState(parseInt(paperPage) || 1)
    const [imagePageNumberStart, setImagePageNumberStart] = useState(1)
    const [imagePageNumberEnd, setImagePageNumberEnd] = useState(1)



    useEffect(() => {
        const paperPageNumber = parseInt(paperPage)
        if (imagePageNumberStart > paperPageNumber) {
            setImagePageNumber(1)
        }
        if (paperPageNumber > imagePageNumberEnd) {
            setImagePageNumber(1)
        }
    }, [paperPage])

    const cookieKey = useMemo(() => {
        return `draggableComponentList_${paperName}_${imagePageNumber}`
    }, [paperName, imagePageNumber])

    const [draggableComponentList, setDraggableComponentList] = useState([])

    const [rerenderListCompletely, setRerenderListCompletely] = useState(true)
    
    useEffect(() => {
        // console.log(localStorage.getItem(cookieKey))
        setDraggableComponentList(JSON.parse(localStorage.getItem(cookieKey))  || [])
        setRerenderListCompletely(false)

        // console.log(getCookie(cookieKey))
    }, [cookieKey])

    useEffect(() => {
        if (!rerenderListCompletely) {
            setRerenderListCompletely(true)
        }
    }, [rerenderListCompletely])

    const [isPrintingPage, setIsPrintingPage] = useState(false)

    const [pdf, setPdf] = useState(new jsPDF('p', 'mm', 'a4'))
    
    const printRef = useRef()
    const signatureRef = useRef()
    
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const [progressPercent, setProgressPercent] = useState(-1)
    
    useEffect(() => {
        if (!isPrintingPage) {
            return
        }
        if (imagePageNumber > imagePageNumberEnd) {
            setIsPrintingPage(false)
            return
        }

        // todo: hack to render background image and cookie addon elements
        sleep(400).then(() => {
            const element = printRef.current
            // const element = document.getElementById('printRef')
            html2canvas(element, {useCORS: true, allowTaint: true, logging: false})
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
    
                    const imgWidth = 210;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
                    
                    if (imagePageNumber !== imagePageNumberEnd) {
                        setProgressPercent(Math.round(100 * imagePageNumber / imagePageNumberEnd))

                        pdf.addPage()
                        setImagePageNumber(imagePageNumber + 1)
                    } else {
                        setProgressPercent(100)

                        pdf.save('download.pdf');
                        setIsPrintingPage(false)

                        setTimeout(() => {
                            setProgressPercent(-1)
                        }, 2000)
                    }
                })
        })
        
    }, [isPrintingPage, imagePageNumber])



    const saveAsPDF = async () => {
        setPdf(new jsPDF('p', 'mm', 'a4'))
        
        setIsPrintingPage(true)
        setImagePageNumber(imagePageNumberStart)
        
        setProgressPercent(0)
        
        
    }

    const [segmentedValue, setSegmentedValue] = useState('Text Box')
    const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false)
    const [signature, setSignature] = useState(localStorage.getItem('signature') || '')
    const [printedName, setPrintedName] = useState(localStorage.getItem('printedName') || '')
    const [nameInitials, setNameInitials] = useState(localStorage.getItem('nameInitials') || '')

    const [PDFImages, setPDFImages] = useState(JSON.parse(localStorage.getItem('PDFImages')) || [])

    useEffect(() => {
        if (signatureRef.current) {
            const tmp = localStorage.getItem('signature')

            signatureRef.current.fromDataURL(tmp, { width: 500, height: 200 })
            setRerenderListCompletely(false)
        }
    }, [signatureRef.current, isSignatureModalVisible])


    const readFileData = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          reader.onerror = (err) => {
            reject(err);
          };
          reader.readAsDataURL(file);
        });
      };
      
      //param: file -> the input file (e.g. event.target.files[0])
      //return: images -> an array of images encoded in base64 
      const convertPdfToImages = async (file) => {

        const images = [];
        const data = await readFileData(file);
        const pdf = await PDFJS.getDocument(data).promise;
        const canvas = document.createElement("canvas");
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 2 });
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL());
        }
        canvas.remove();

        // console.log(images)
        setImagePageNumber(1)
        setImagePageNumberEnd(images.length)
        // localStorage.setItem('PDFImages', JSON.stringify(images))
        return images;
      }

    const openPDF = (file) => {
        // console.log(file)
        convertPdfToImages(file)
            .then((images) => {
                setPDFImages(images)
                setRerenderListCompletely(false)
            })
    }

    const imageURL = useMemo(() => {
        return PDFImages[imagePageNumber - 1]
    }, [imagePageNumber, rerenderListCompletely])

    return (
        <Layout style={{'minWidth': '1000px'}}>

            <Affix offsetTop={0}>
                <Layout.Header style={{'background': 'white', 'height': '70px'}}>
                    <Row justify='center' align='top' style={{'backgroundColor': 'white', 'height': '100%'}}>
                        <Row justify='space-between' align='top' style={{'maxWidth': '2000px', 'width': '100%', 'height': '100%', 'backgroundColor': 'white'}}>
                            <Col style={{'cursor': 'pointer'}} onClick={() => { window.scrollTo(0, 0)}}>
                                <Row justify='center' align='bottom'>
                                    <Col>
                                        <Image height={30} preview={false} src={state.appLogo}></Image>
                                    </Col>
                                    <Col>
                                        <Typography.Title level={3} style={{'color': 'black', 'marginLeft': '10px'}}>{state.appName}</Typography.Title>
                                    </Col>
                                </Row>
                            </Col>

                            <Col>
                                <Upload showUploadList={false} onChange={(info) => {
                                    openPDF(info.file.originFileObj)
                                }}>
                                    <Button style={{'marginTop': '25px'}}
                                        disabled={progressPercent !== -1}
                                        onClick={() => {
                                        }}
                                        icon={
                                            <UploadOutlined />
                                        }
                                    >
                                        Open PDF
                                    </Button>
                                </Upload>
                            </Col>
                            
                            <Col>
                                <Popover content={<Typography>Ctrl + Click on the PDF file below to add a new item</Typography>}>
                                    <Button style={{'cursor': 'default'}} 
                                        type='text' 
                                        icon={<HomeOutlined style={{'color': 'gray'}} />}>
                                    </Button>
                                </Popover>

                                <Segmented
                                    style={{'marginTop': '25px'}}
                                    options={['Text Box', 'Signature', 'Printed Name', 'Name Initials']}
                                    value={segmentedValue}
                                    onChange={(value) => {
                                        setSegmentedValue(value)

                                        if (value === 'Signature' && !signature) {
                                            setIsSignatureModalVisible(true)
                                        } else if (value === 'Printed Name' && !printedName) {
                                            setIsSignatureModalVisible(true)
                                        } else if (value === 'Name Initials' && !nameInitials) {
                                            setIsSignatureModalVisible(true)
                                        }
                                    }}
                                />
                                
                                <Popover content={<Typography>Edit Signature</Typography>}>
                                    <Button type='text' icon={<EditOutlined style={{'color': 'gray'}} />} onClick={() => {
                                        setIsSignatureModalVisible(true)
                                    }}>
                                    </Button>
                                </Popover>
                            </Col>

                            <Modal title='Signatures' open={isSignatureModalVisible} 
                                footer={<Button onClick={() => {
                                    setIsSignatureModalVisible(false)

                                    if (segmentedValue === 'Signature' && !signature) {
                                        setSegmentedValue('Text Box')
                                    } else if (segmentedValue === 'Printed Name' && !printedName) {
                                        setSegmentedValue('Text Box')
                                    } else if (segmentedValue === 'Name Initials' && !nameInitials) {
                                        setSegmentedValue('Text Box')
                                    }
                                }}>OK</Button>}
                                closable={true}
                                closeIcon={<CloseOutlined onClick={() => {
                                    setIsSignatureModalVisible(false)

                                    if (segmentedValue === 'Signature' && !signature) {
                                        setSegmentedValue('Text Box')
                                    } else if (segmentedValue === 'Printed Name' && !printedName) {
                                        setSegmentedValue('Text Box')
                                    } else if (segmentedValue === 'Name Initials' && !nameInitials) {
                                        setSegmentedValue('Text Box')
                                    }
                                }} />}
                                maskClosable={false}
                            >
                                <Row justify='center' 
                                        style={{'borderRadius': '16px', 'boxShadow': "5px 8px 24px 5px rgba(208, 216, 243, 0.6)"}}>
                                    <SignatureCanvas ref={signatureRef} penColor='blue' canvasProps={{width: 500, height: 200}}     

                                        onEnd={() => {
                                            const tmp = signatureRef.current.getCanvas().toDataURL('image/png')
                                            setSignature(tmp)
                                            localStorage.setItem('signature', tmp)
                                        }}
                                    />
                                </Row>
                                
                                <Row justify='end' style={{'margin': '10px 0px'}}>
                                    <Button onClick={() => {
                                            signatureRef?.current?.clear()
                                            localStorage.removeItem('signature')
                                        }}
                                        icon={<DeleteOutlined />}
                                    >
                                    Clear Signature
                                    </Button>
                                </Row>

                                <Row justify='start' style={{'margin': '10px 0px'}}>
                                    <Input placeholder='Printed Name' value={printedName} onChange={(e) => {
                                            setPrintedName(e.target.value)
                                            localStorage.setItem('printedName', e.target.value)
                                        }}
                                        //allowClear={true}
                                        //onClear={() => {
                                        //    setPrintedName('')
                                        //}}
                                    />
                                </Row>
                                
                                <Row justify='start' style={{'margin': '10px 0px'}}>
                                    <Input placeholder='Name Initials' value={nameInitials} onChange={(e) => {
                                            setNameInitials(e.target.value)
                                            localStorage.setItem('nameInitials', e.target.value)
                                        }}
                                        //allowClear={true}
                                        //onClear={() => {
                                        //    setNameInitials('')
                                        //}}
                                    />
                                </Row>
                            </Modal>

                            <Col>
                                <Button style={{'marginTop': '25px'}}
                                    disabled={progressPercent !== -1}
                                    onClick={() => {
                                        saveAsPDF()
                                    }}
                                    icon={
                                        progressPercent === -1?
                                            <DownloadOutlined />
                                        :
                                            <Progress type='circle' percent={progressPercent} size={14} />
                                    }
                                >
                                    Download PDF
                                </Button>
                            </Col>
                            
                        </Row>


                    </Row>

                    
                </Layout.Header>

            </Affix>

            <Layout.Content style={{'backgroundColor': 'white'}} >

                <Row justify='center'>
                    <Col>
                        {/** printableSection
                            https://stackoverflow.com/questions/44989119/generating-a-pdf-file-from-react-components 
                        */}
                        <Row ref={printRef} id='printRef' justify='center' >
                            <Row justify='center' style={{'position': 'fixed', 'zIndex': 1}}>
                                { rerenderListCompletely &&
                                    draggableComponentList?.map((item, idx) => {
                                        if (item.type === 'image') {
                                            return (
                                                <DraggableImage 
                                                    key={idx}
                                                    content={item.content || ''}
                                                    x={item.x}
                                                    y={item.y}
                                                    width={item.width}
                                                    height={item.height}
                                                    updateXY={(x, y) => {
                                                        const newList = draggableComponentList
                                                        newList[idx]['x'] = x
                                                        newList[idx]['y'] = y
                                                        
                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))


                                                    }}
                                                    updateWidthHeight={(width, height) => {
                                                        const newList = draggableComponentList
                                                        newList[idx]['width'] = width
                                                        newList[idx]['height'] = height

                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))
                                                    }}
                                                    deleteItem={() => {
                                                        const newList = [
                                                            ...draggableComponentList.slice(0, idx),
                                                            ...draggableComponentList.slice(idx+1),
                                                        ]
                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))
                                                        setRerenderListCompletely(false)
                                                        
                                                    }}
                                                />
                                            )
                                        } else {
                                            return (
                                                <DraggableText
                                                    key={idx}
                                                    content={item.content || ''}
                                                    x={item.x} 
                                                    y={item.y}
                                                    updateContent={(content) => {
                                                        const newList = draggableComponentList
                                                        newList[idx]['content'] = content
                                                        
                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))


                                                    }}
                                                    updateXY={(x, y) => {
                                                        const newList = draggableComponentList
                                                        newList[idx]['x'] = x
                                                        newList[idx]['y'] = y
                                                        
                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))


                                                    }}
                                                    deleteItem={() => {

                                                        const newList = [
                                                            ...draggableComponentList.slice(0, idx),
                                                            ...draggableComponentList.slice(idx+1),
                                                        ]
                                                        setDraggableComponentList(newList)
                                                        localStorage.setItem([cookieKey], JSON.stringify(newList))
                                                        setRerenderListCompletely(false)
                                                    }}
                                                />
                                            )
                                        }
                                    })
                                }
                            </Row>

                            <Image id='imageRef' src={imageURL}
                                preview={false} 
                                style={{'maxWidth': '100vw', 'maxHeight': '85vh', 'zIndex': 0}} 
                                onMouseDown={(e) => {
                                    if (e.ctrlKey) {
                                        const newItem = 
                                            segmentedValue === 'Signature'?
                                            {
                                                'type': 'image',
                                                'content': signature,
                                                'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                'y': e.clientY - 80, // header height
                                                'width': 500,
                                                'height': 200,
                                            }
                                            : segmentedValue === 'Printed Name'?
                                            {
                                                'type': 'text',
                                                'content': printedName,
                                                'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                'y': e.clientY - 80, // header height
                                            }
                                            : segmentedValue === 'Name Initials'?
                                            {
                                                'type': 'text',
                                                'content': nameInitials,
                                                'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                'y': e.clientY - 80, // header height
                                            }
                                            :
                                            {
                                                'type': 'text',
                                                'content': '',
                                                'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                'y': e.clientY - 80, // header height
                                            }
                                            
                                        const newList = [
                                            ...draggableComponentList,
                                            newItem,
                                        ]
                                        
                                        // console.log(signature)
                                        setDraggableComponentList(newList)
                                        localStorage.setItem([cookieKey], JSON.stringify(newList))


                                    }
                                }}
                            />
                        </Row>
                    </Col>
                </Row>

                { PDFImages.length > 0 &&
                <Row justify='center' align='middle' style={{'width': '100%'}} >
                    <Space.Compact>

                        <Button shape='circle' icon={<LeftOutlined />} disabled={imagePageNumber === imagePageNumberStart} onClick={() => {
                            const newImagePageNumber = imagePageNumber - 1
                            setImagePageNumber(newImagePageNumber)

                        }}></Button>
 
                        <Row justify='center' align='middle' style={{'width': '100px'}}>
                            <Button style={{'width': '100%', 'cursor': 'default'}}>
                                <Typography>{imagePageNumber}/{imagePageNumberEnd}</Typography>
                            </Button>
                        </Row>
 
                        <Button shape='circle' icon={<RightOutlined />} disabled={imagePageNumber === imagePageNumberEnd} onClick={() => {
                            const newImagePageNumber = imagePageNumber + 1
                            setImagePageNumber(newImagePageNumber)

                        }}></Button>
   
                    </Space.Compact>

                    
                </Row>
                }



            </Layout.Content>
        </Layout>
    )
}

export default DesktopPaper
