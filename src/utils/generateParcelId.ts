function generateParcelId(branchCode: string){
    const date = new Date();

    // YYMMDD
    const yyyymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
    
    // second since midnight
    const secondsSinceMidnight = Math.floor((date.getTime() - new Date(date.toDateString()).getTime()) / 1000);

    // Convert to Base36 (short form, human readable)
    const base36 = (secondsSinceMidnight).toString(36).toUpperCase();
    
    // Random 2 digit (Base36 for more uniqueness)
    const random2 = Math.floor(Math.random() * 36).toString(36).toUpperCase();

    return `${branchCode}-${yyyymmdd}-${base36}-${random2}`;
}

export default generateParcelId;