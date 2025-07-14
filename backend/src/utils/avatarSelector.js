const avatars = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
    "avatar5.png",
    "avatar6.png",
    "avatar7.png",
    "avatar8.png",
    "avatar9.png",
    "avatar10.png"
];

const getAvatarUrl = () => {
    const index = Math.floor(Math.random() * 1000);
    // return avatars[index];
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${index}`;
};

const isAvatarAvailable =(avatarIdx)=>{
    // return (avatarIdx <= avatars.length-1 && avatarIdx>=0)
    return true;
}

const getCustomAvatarUrl =(avatarIdx)=>{
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarIdx}`
}

export { getAvatarUrl, isAvatarAvailable, getCustomAvatarUrl };