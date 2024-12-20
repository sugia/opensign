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
    Empty,
    Spin,
    Drawer,
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
    BulbOutlined,
    AlertOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    InboxOutlined,
} from '@ant-design/icons'

import {
    useContext,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from 'react'

import { Context } from './store/Context'

import { useNavigate, useParams } from 'react-router-dom'

import html2canvas from 'html2canvas'

import jsPDF from 'jspdf'

import * as PDFJS from 'pdfjs-dist/webpack'


import DraggableText from './DraggableText'
import DraggableImage from './DraggableImage'
import DesktopDrawingPad from './DesktopDrawingPad'

function DesktopPaper() {
    const { state, dispatch } = useContext(Context)
    const navigate = useNavigate()

    const [PDFImages, setPDFImages] = useState([])


    const [PDFName, setPDFName] = useState('')
    const [imagePageNumber, setImagePageNumber] = useState(1)

    const imagePageNumberStart = 1
    const imagePageNumberEnd = useMemo(() => {
        return PDFImages.length
    }, [PDFImages.length])

    const localStorageKey = useMemo(() => {
        return `draggableComponentList_${PDFName}_${imagePageNumber}`
    }, [PDFName, imagePageNumber])

    const [draggableComponentList, setDraggableComponentList] = useState([])

    const [rerenderListCompletely, setRerenderListCompletely] = useState(true)

    useEffect(() => {
        setDraggableComponentList(JSON.parse(localStorage.getItem(localStorageKey)) || [])
        setRerenderListCompletely(false)
    }, [localStorageKey])

    useEffect(() => {
        if (!rerenderListCompletely) {
            setRerenderListCompletely(true)
        }
    }, [rerenderListCompletely])

    const [isPrintingPage, setIsPrintingPage] = useState(false)

    const [pdf, setPdf] = useState(new jsPDF('p', 'mm', 'a4', true))
    const [progressPercent, setProgressPercent] = useState(-1)

    const printRef = useRef()


    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }


    const [lastImagePageNumber, setLastImagePageNumber] = useState(1)

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
            html2canvas(element, { useCORS: true, allowTaint: true, logging: false })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');

                    const imgWidth = 210;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    // NONE, FAST, MEDIUM, SLOW
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');


                    if (imagePageNumber !== imagePageNumberEnd) {
                        setProgressPercent(Math.round(100 * imagePageNumber / imagePageNumberEnd))

                        pdf.addPage()
                        setImagePageNumber(imagePageNumber + 1)
                    } else {
                        setProgressPercent(100)

                        pdf.save(`${PDFName}_OpenSign.pdf`)
                        setIsPrintingPage(false)

                        setTimeout(() => {
                            setProgressPercent(-1)
                            setImagePageNumber(lastImagePageNumber)
                        }, 2000)


                    }
                })
        })

    }, [isPrintingPage, imagePageNumber])



    const saveAsPDF = async () => {
        setLastImagePageNumber(imagePageNumber)

        setPdf(new jsPDF('p', 'mm', 'a4', true))

        setProgressPercent(0)
        setImagePageNumber(imagePageNumberStart)
        setIsPrintingPage(true)
    }

    const [segmentedValue, setSegmentedValue] = useState('Text Box')



    const [signatureWidth, setSignatureWidth] = useState(localStorage.getItem('signatureWidth') || state.signatureCanvasWidth)
    const [signatureHeight, setSignatureHeight] = useState(localStorage.getItem('signatureHeight') || state.signatureCanvasHeight)

    const [isLoadingPDF, setIsLoadingPDF] = useState(false)


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

        setImagePageNumber(1)

        setIsLoadingPDF(false)
        return images;
    }

    const openPDF = (file) => {

        setIsLoadingPDF(true)

        convertPdfToImages(file)
            .then((images) => {
                setPDFImages(images)
                setRerenderListCompletely(false)
                setPDFName(file.name.replace(/\.[^/.]+$/, ""))
            })
    }

    const imageURL = useMemo(() => {
        return PDFImages[imagePageNumber - 1]
    }, [imagePageNumber, rerenderListCompletely])


    const segmentedOptions = useMemo(() => {
        const res = ['Text Box']
        if (state.signature) {
            res.push('Signature')
        }
        if (state.printedName) {
            res.push('Printed Name')
        }
        if (state.nameInitials) {
            res.push('Name Initials')
        }
        if (state.date) {
            res.push('Date')
        }
        return res
    }, [state.signature, state.printedName, state.nameInitials, state.date, rerenderListCompletely])


    const [isDownloadConfirmVisible, setIsDownloadConfirmVisible] = useState(false)

    return (
        <Layout style={{ 'minWidth': '1000px' }}>

            <Affix offsetTop={0}>
                <Layout.Header style={{ 'background': 'white', 'height': '70px' }}>
                    <Row justify='center' align='top' style={{ 'backgroundColor': 'white', 'height': '100%' }}>
                        <Row justify='space-between' align='top' style={{ 'maxWidth': '2000px', 'width': '100%', 'height': '100%', 'backgroundColor': 'white' }}>
                            <Col span={4} style={{ 'cursor': 'pointer' }} onClick={() => { window.scrollTo(0, 0) }}>
                                <Row justify='center' align='bottom'>
                                    <Col>
                                        <Image height={30} preview={false} src={state.appLogo}></Image>
                                    </Col>
                                    <Col>
                                        <Typography.Title level={3} style={{ 'color': 'black', 'marginLeft': '10px' }}>{state.appName}</Typography.Title>
                                    </Col>
                                </Row>
                            </Col>


                            <Col span={16} style={{ 'visibility': PDFImages.length === 0 ? 'hidden' : 'visible' }}>
                                <Row justify='center' align='bottom'>
                                    <Popover content={<Typography>Ctrl + Click on the PDF file below to add a new item</Typography>}>
                                        <Button style={{ 'cursor': 'default' }}
                                            type='text'
                                            icon={<HomeOutlined style={{ 'color': 'gray' }} />}>
                                        </Button>
                                    </Popover>


                                    <Segmented
                                        style={{ 'marginTop': '25px' }}
                                        options={segmentedOptions}
                                        value={segmentedValue}
                                        onChange={(value) => {
                                            setSegmentedValue(value)
                                        }}
                                    />


                                    <Popover trigger='click' placement='bottomLeft' title='' content={

                                        <DesktopDrawingPad />
                                    }>

                                        <Button type='text' icon={<EditOutlined style={{ 'color': 'gray' }} />} onClick={() => {
                                        }}>

                                        </Button>
                                    </Popover>



                                </Row>

                            </Col>

                            <Col span={4} style={{ 'visibility': PDFImages.length === 0 ? 'hidden' : 'visible' }}>
                                <Row justify='center'>
                                    <Space.Compact>
                                        <Popover content={<Typography>Open PDF</Typography>}>
                                            <Upload accept='.pdf' showUploadList={false} onChange={(info) => {
                                                openPDF(info.file.originFileObj)
                                            }}>
                                                <Button style={{ 'marginTop': '25px' }} shape='round'
                                                    disabled={progressPercent !== -1}
                                                    onClick={() => {
                                                    }}
                                                    icon={
                                                        <FolderOpenOutlined style={{ 'color': 'gray' }} />
                                                    }
                                                >
                                                </Button>
                                            </Upload>
                                        </Popover>

                                        <Popover content={<Typography>Download PDF</Typography>}>
                                            <Button style={{
                                                'marginTop': '25px',
                                                'backgroundColor': isDownloadConfirmVisible ? 'lawnGreen' : 'white'
                                            }}
                                                shape='round'
                                                disabled={progressPercent !== -1}
                                                type={isDownloadConfirmVisible ? 'primary' : 'default'}
                                                onClick={() => {
                                                    if (isDownloadConfirmVisible) {
                                                        setIsDownloadConfirmVisible(false)
                                                        saveAsPDF()
                                                    } else {
                                                        setIsDownloadConfirmVisible(true)
                                                        setTimeout(() => {
                                                            setIsDownloadConfirmVisible(false)
                                                        }, 2000)
                                                    }
                                                }}
                                                icon={
                                                    progressPercent === -1 ?
                                                        <DownloadOutlined style={{ 'color': isDownloadConfirmVisible ? 'black' : 'gray' }} />
                                                        :
                                                        <Progress type='circle' percent={progressPercent} size={14} />
                                                }
                                            >

                                            </Button>
                                        </Popover>
                                    </Space.Compact>
                                </Row>
                            </Col>

                        </Row>


                    </Row>


                </Layout.Header>

            </Affix>

            <Layout.Content style={{ 'backgroundColor': 'white' }} >
                {
                    isLoadingPDF ?
                        <Row justify='center' align='middle' style={{ 'height': '80vh' }}>
                            <Spin size='large' />
                        </Row>
                        :
                        PDFImages.length === 0 ?
                            <Row justify='center' align='middle' style={{ 'height': '80vh' }}>
                                <Upload.Dragger accept='.pdf' showUploadList={false} onChange={(info) => {
                                    openPDF(info.file.originFileObj)
                                }}>
                                    <div style={{ 'width': '400px' }}>
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined />
                                        </p>
                                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                        <p className="ant-upload-hint">
                                            Easily upload your PDF by clicking to select files from your device or dragging a PDF file and dropping into the box here.
                                        </p>
                                    </div>
                                </Upload.Dragger>
                            </Row>
                            :
                            <>
                                <Row justify='center'>

                                    <Col>

                                        {/** printableSection
                                        https://stackoverflow.com/questions/44989119/generating-a-pdf-file-from-react-components 
                                    */}
                                        <Row ref={printRef} id='printRef' justify='center' >
                                            <Row justify='center' style={{ 'position': 'fixed', 'zIndex': 1 }}>
                                                {rerenderListCompletely &&
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
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))


                                                                    }}
                                                                    updateWidthHeight={(width, height) => {
                                                                        const newList = draggableComponentList
                                                                        newList[idx]['width'] = width
                                                                        newList[idx]['height'] = height

                                                                        setDraggableComponentList(newList)
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))

                                                                        setSignatureWidth(width)
                                                                        setSignatureHeight(height)
                                                                        localStorage.setItem('signatureWidth', width)
                                                                        localStorage.setItem('signatureHeight', height)
                                                                    }}
                                                                    deleteItem={() => {
                                                                        const newList = [
                                                                            ...draggableComponentList.slice(0, idx),
                                                                            ...draggableComponentList.slice(idx + 1),
                                                                        ]
                                                                        setDraggableComponentList(newList)
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))
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
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))


                                                                    }}
                                                                    updateXY={(x, y) => {
                                                                        const newList = draggableComponentList
                                                                        newList[idx]['x'] = x
                                                                        newList[idx]['y'] = y

                                                                        setDraggableComponentList(newList)
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))


                                                                    }}
                                                                    deleteItem={() => {

                                                                        const newList = [
                                                                            ...draggableComponentList.slice(0, idx),
                                                                            ...draggableComponentList.slice(idx + 1),
                                                                        ]
                                                                        setDraggableComponentList(newList)
                                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))
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
                                                style={{ 'maxWidth': '100vw', 'maxHeight': '85vh', 'zIndex': 0 }}
                                                onMouseDown={(e) => {
                                                    if (e.ctrlKey) {
                                                        const newItem =
                                                            segmentedValue === 'Signature' ?
                                                                {
                                                                    'type': 'image',
                                                                    'content': state.signature,
                                                                    'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                                    'y': e.clientY - 80, // header height
                                                                    'width': signatureWidth,
                                                                    'height': signatureHeight,
                                                                }
                                                                : segmentedValue === 'Printed Name' ?
                                                                    {
                                                                        'type': 'text',
                                                                        'content': state.printedName,
                                                                        'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                                        'y': e.clientY - 80, // header height
                                                                    }
                                                                    : segmentedValue === 'Name Initials' ?
                                                                        {
                                                                            'type': 'text',
                                                                            'content': state.nameInitials,
                                                                            'x': e.clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                                            'y': e.clientY - 80, // header height
                                                                        }
                                                                        : segmentedValue === 'Date' ?
                                                                            {
                                                                                'type': 'text',
                                                                                'content': state.date,
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
                                                        localStorage.setItem([localStorageKey], JSON.stringify(newList))

                                                    }
                                                }}
                                            />
                                        </Row>
                                    </Col>
                                </Row>


                                <Row justify='center' align='middle' style={{ 'width': '100%' }} >
                                    <Space.Compact>

                                        <Button shape='circle' icon={<LeftOutlined />} disabled={isPrintingPage || imagePageNumber === imagePageNumberStart} onClick={() => {
                                            const newImagePageNumber = imagePageNumber - 1
                                            setImagePageNumber(newImagePageNumber)

                                        }}></Button>

                                        <Row justify='center' align='middle' style={{ 'width': '100px' }}>
                                            <Button style={{ 'width': '100%', 'cursor': 'default' }}>
                                                <Typography>{imagePageNumber}/{imagePageNumberEnd}</Typography>
                                            </Button>
                                        </Row>

                                        <Button shape='circle' icon={<RightOutlined />} disabled={isPrintingPage || imagePageNumber === imagePageNumberEnd} onClick={() => {
                                            const newImagePageNumber = imagePageNumber + 1
                                            setImagePageNumber(newImagePageNumber)

                                        }}></Button>

                                    </Space.Compact>


                                </Row>

                            </>
                }




            </Layout.Content>
        </Layout>
    )
}

export default DesktopPaper
