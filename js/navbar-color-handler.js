export function navbarColorHandler() {
    const navbar = document.querySelector('.navbar');
    if(navbar) {

        const lightSections = document.querySelectorAll('.light-section');
        const darkSections = document.querySelectorAll('.dark-section');

        if(lightSections.length > 0) {
            lightSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: `bottom ${navbar.offsetHeight}px`,
                    markers: true,
                    onEnter: ()=> {
                        navbar.classList.add('text-color-primary');
                    },
                    onLeave: ()=> {
                        navbar.classList.remove('text-color-primary');
                    },
                    onEnterBack: ()=> {
                        navbar.classList.add('text-color-primary');
                    },
                    onLeaveBack: ()=> {
                        navbar.classList.remove('text-color-primary');
                    }
                });
            });
        }

        if(darkSections.length > 0) {
            darkSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: `bottom ${navbar.offsetHeight}px`,
                    markers: true,
                    onEnter: ()=> {
                        navbar.classList.add('text-color-seconday');
                    },
                    onLeave: ()=> {
                        navbar.classList.remove('text-color-secondary');
                    },
                    onEnterBack: ()=> {
                        navbar.classList.add('text-color-secondary');
                    },
                    onLeaveBack: ()=> {
                        navbar.classList.remove('text-color-secondary');
                    }
                });
            });
        }


    }
}