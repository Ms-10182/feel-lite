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
    const index = Math.floor(Math.random() * 10);
    return avatars[index];
};

export { getAvatarUrl };