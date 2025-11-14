function formatDate(date: any, adjustDay = 0) {
    date.setDate(date.getDate() + adjustDay);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


export default formatDate;