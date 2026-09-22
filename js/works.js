export function works() {
    // Work Case Link Redirect (for case links in Homepage and Works)
    const workCaseLinks = document.querySelectorAll('.work_case_link');
    if (workCaseLinks.length > 0) {
        workCaseLinks.forEach(link => {
            link.href += link.getAttribute('slug');
        });
    }


    // Building Location Numbering in Works
    const locationItems = document.querySelectorAll('.location-list-item');
    if(locationItems.length > 0) {
        locationItems.forEach((item, i) => {
            const locationNumber = item.querySelector('.location-number');
            if (locationNumber) {
                if(i<10) {
                    locationNumber.textContent = `00${i + 1}`;
                }else if(i>99) {
                    locationNumber.textContent = `${i + 1}`;
                } else {
                    locationNumber.textContent = `0${i + 1}`;
                }
            }
        });
    }

}