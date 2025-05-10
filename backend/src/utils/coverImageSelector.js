const coverImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg',
    'https://example.com/image5.jpg',
    'https://example.com/image6.jpg',
    'https://example.com/image7.jpg',
    'https://example.com/image8.jpg',
    'https://example.com/image9.jpg',
    'https://example.com/image10.jpg'
];

const getCoverImageUrl = ()=>{
    const index = Math.floor(Math.random() * coverImages.length)
    return coverImages[index]
}
const isCoverImageAvailable = (coverImageIdx)=>{
    return (coverImageIdx<=coverImages.length-1 && coverImageIdx>=0)
}

const getCustomCoverImageUrl = (coverImageIdx)=>{
    return coverImages[coverImageIdx]
}
export { getCoverImageUrl, isCoverImageAvailable, getCustomCoverImageUrl }