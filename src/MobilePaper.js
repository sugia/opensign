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
    Popup,
    Tabs,
} from 'antd-mobile'

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

import Draggable from 'react-draggable'

import html2canvas from 'html2canvas'

import jsPDF from 'jspdf'

import * as PDFJS from 'pdfjs-dist/webpack'

import MobileDraggableText from './MobileDraggableText'
import MobileDraggableImage from './MobileDraggableImage'
import MobileDrawingPad from './MobileDrawingPad'


function MobilePaper() {
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
        return `mobileDraggableComponentList_${PDFName}_${imagePageNumber}`
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

    const [pdf, setPdf] = useState(new jsPDF('p', 'mm', 'a4'))


    const printRef = useRef()

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
            html2canvas(element, { useCORS: true, allowTaint: true, logging: false })
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



    const [signatureWidth, setSignatureWidth] = useState(
        localStorage.getItem('mobileSignatureWidth') || state.mobileSignatureCanvasWidth)
    const [signatureHeight, setSignatureHeight] = useState(
        localStorage.getItem('mobileSignatureHeight') || state.mobileSignatureCanvasHeight)

    const [isLoadingPDF, setIsLoadingPDF] = useState(false)


    const [isToolsVisible, setIsToolsVisible] = useState(false)

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
        // console.log(file)
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


    let longTouchTimer
    // console.log(draggableComponentList)

    return (
        <Layout>
            <Affix offsetTop={0}>
                <Layout.Header style={{ 'background': 'white', 'height': '70px', 'padding': '0px' }}>
                    <Row justify='center' align='top' style={{ 'backgroundColor': 'white', 'height': '100%' }}>
                        <Row justify='space-between' align='top' style={{ 'width': '100%', 'height': '100%', 'backgroundColor': 'white' }}>
                            <Col offset={1} span={2}>
                                <Image preview={false} src={state.appLogo} style={{ 'width': '30px', 'height': '30px' }}></Image>
                            </Col>
                            <Col span={4}>
                                <Typography style={{ 'fontSize': '14px', 'marginTop': '25px' }}>{state.appName}</Typography>
                            </Col>


                            <Col span={10} style={{ 'visibility': PDFImages.length === 0 ? 'hidden' : 'visible' }}>
                                <Row justify='center'>
                                    <Button shape='round' style={{ 'marginTop': '20px', 'color': 'gray' }} onClick={() => {
                                        setIsToolsVisible(true)
                                    }}>
                                        {state.mobileSegmentedValue}
                                    </Button>

                                    <Popup
                                        visible={isToolsVisible}
                                        onMaskClick={() => {
                                            setIsToolsVisible(false)
                                        }}
                                        onClose={() => {
                                            setIsToolsVisible(false)
                                        }}
                                        bodyStyle={{ 'height': '40vh' }}
                                    >

                                        <MobileDrawingPad />


                                    </Popup>

                                </Row>

                            </Col>

                            <Col span={7} style={{ 'visibility': PDFImages.length === 0 ? 'hidden' : 'visible' }}>
                                <Row justify='center' style={{ 'marginTop': '20px' }} >
                                    <Space.Compact>

                                        <Upload accept='.pdf' showUploadList={false} onChange={(info) => {
                                            openPDF(info.file.originFileObj)
                                        }}>
                                            <Button shape='round' size='medium'
                                                disabled={progressPercent !== -1}
                                                onClick={() => {
                                                }}
                                                icon={
                                                    <FolderOpenOutlined style={{ 'color': 'gray' }} />
                                                }
                                            >
                                            </Button>
                                        </Upload>



                                        <Button shape='round' size='medium'
                                            disabled={progressPercent !== -1}
                                            onClick={() => {
                                                saveAsPDF()
                                            }}
                                            icon={
                                                progressPercent === -1 ?
                                                    <DownloadOutlined style={{ 'color': 'gray' }} />
                                                    :
                                                    <Progress type='circle' percent={progressPercent} size={14} />
                                            }
                                        >

                                        </Button>

                                    </Space.Compact>
                                </Row>
                            </Col>

                        </Row>


                    </Row>


                </Layout.Header>

            </Affix>

            <Layout.Content style={{ 'backgroundColor': 'white' }} >
                {!isLoadingPDF && PDFImages.length === 0 &&
                    <Row justify='center' align='middle' style={{ 'height': '80vh' }}>
                        <Upload.Dragger accept='.pdf' showUploadList={false} onChange={(info) => {
                            openPDF(info.file.originFileObj)
                        }}>
                            <div style={{ 'width': '300px' }}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click to upload</p>
                                <p className="ant-upload-hint">
                                    Easily upload your PDF by clicking to select files from your device.
                                </p>
                            </div>
                        </Upload.Dragger>
                    </Row>
                }
                {isLoadingPDF &&
                    <Row justify='center' align='middle' style={{ 'height': '80vh' }}>
                        <Spin size='large' />
                    </Row>
                }
                {
                    !isLoadingPDF && PDFImages.length > 0 &&

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
                                                    <MobileDraggableImage
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
                                                            localStorage.setItem('mobileSignatureWidth', width)
                                                            localStorage.setItem('mobileSignatureHeight', height)
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
                                                    <MobileDraggableText
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
                                    onTouchStart={(e) => {
                                        // console.log(e)
                                        longTouchTimer = setTimeout(() => {
                                            const newItem =
                                                state.mobileSegmentedValue === 'Signature' ?
                                                    {
                                                        'type': 'image',
                                                        'content': state.mobileSignature,
                                                        'x': e.touches[0].screenX - window.innerWidth / 2 - 10, // Row justify='center'
                                                        'y': e.touches[0].clientY - 80, // header height
                                                        'width': signatureWidth,
                                                        'height': signatureHeight,
                                                    }
                                                    : state.mobileSegmentedValue === 'Printed Name' ?
                                                        {
                                                            'type': 'text',
                                                            'content': state.mobilePrintedName,
                                                            'x': e.touches[0].clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                            'y': e.touches[0].clientY - 80, // header height
                                                        }
                                                        : state.mobileSegmentedValue === 'Name Initials' ?
                                                            {
                                                                'type': 'text',
                                                                'content': state.mobileNameInitials,
                                                                'x': e.touches[0].clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                                'y': e.touches[0].clientY - 80, // header height
                                                            }
                                                            :
                                                            {
                                                                'type': 'text',
                                                                'content': '',
                                                                'x': e.touches[0].clientX - window.innerWidth / 2 - 10, // Row justify='center'
                                                                'y': e.touches[0].clientY - 80, // header height
                                                            }

                                            const newList = [
                                                ...draggableComponentList,
                                                newItem,
                                            ]

                                            // console.log(signature)
                                            setDraggableComponentList(newList)
                                            localStorage.setItem([localStorageKey], JSON.stringify(newList))

                                        }, 500)

                                    }}
                                    onTouchEnd={() => {
                                        if (longTouchTimer) {
                                            clearTimeout(longTouchTimer)
                                        }
                                    }}
                                />
                            </Row>
                        </Col>
                    </Row>
                }

                {!isLoadingPDF && PDFImages.length > 0 &&
                    <Row justify='center' align='middle' style={{ 'width': '100%', 'position': 'absolute', 'bottom': '40px' }} >
                        <Space.Compact>

                            <Button shape='circle' icon={<LeftOutlined />} disabled={imagePageNumber === imagePageNumberStart} onClick={() => {
                                const newImagePageNumber = imagePageNumber - 1
                                setImagePageNumber(newImagePageNumber)

                            }}></Button>

                            <Row justify='center' align='middle' style={{ 'width': '100px' }}>
                                <Button style={{ 'width': '100%', 'cursor': 'default' }}>
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

export default MobilePaper
