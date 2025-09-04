function generateParcelId(branchCode: string){
    const date = new Date();

    // YYMMDD
    const yyyymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
    
    // Seconds since midnight
    const secondsSinceMidnight = Math.floor((date.getTime() - new Date(date.toDateString()).getTime()) / 1000);

    //  Base36 representation of seconds since midnight
    const base36 = (secondsSinceMidnight).toString(36).toUpperCase();
    
    //  Random alphanumeric character
    const random2 = Math.floor(Math.random() * 36).toString(36).toUpperCase();

    // Final parcel ID
    return `${branchCode}-${yyyymmdd}-${base36}-${random2}`;
}

export default generateParcelId;