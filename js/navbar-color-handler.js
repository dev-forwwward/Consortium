export function navbarColorHandler() {
    const navbar = document.querySelector('.navbar');
    const border = document.querySelector('.border-bottom-el-container-inner');

    if (navbar) {

        const lightSections = document.querySelectorAll('.light-section');
        const darkSections = document.querySelectorAll('.dark-section');

        if (lightSections.length > 0) {
            lightSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: `bottom ${navbar.offsetHeight}px`,
                    onEnter: () => {
                        navbar.classList.add('text-color-primary');
                    },
                    onLeave: () => {
                        navbar.classList.remove('text-color-primary');
                    },
                    onEnterBack: () => {
                        navbar.classList.add('text-color-primary');
                    },
                    onLeaveBack: () => {
                        navbar.classList.remove('text-color-primary');
                    }
                });
            });
        }

        if (darkSections.length > 0) {
            darkSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: `bottom ${navbar.offsetHeight}px`,
                    onEnter: () => {
                        navbar.classList.add('text-color-seconday');
                    },
                    onLeave: () => {
                        navbar.classList.remove('text-color-secondary');
                    },
                    onEnterBack: () => {
                        navbar.classList.add('text-color-secondary');
                    },
                    onLeaveBack: () => {
                        navbar.classList.remove('text-color-secondary');
                    }
                });
            });
        }

    } // if navbar


    if (border) {

        const lightSections = document.querySelectorAll('.light-section');
        const darkSections = document.querySelectorAll('.dark-section');

        if (lightSections.length > 0) {
            lightSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: `top ${window.innerHeight - border.offsetHeight}`,
                    end: `bottom ${window.innerHeight - border.offsetHeight}`,
                    // markers: true,
                    onEnter: () => {
                        border.classList.add('text-color-primary');
                    },
                    onLeave: () => {
                        border.classList.remove('text-color-primary');
                    },
                    onEnterBack: () => {
                        border.classList.add('text-color-primary');
                    },
                    onLeaveBack: () => {
                        border.classList.remove('text-color-primary');
                    }
                });
            });
        }

        if (darkSections.length > 0) {
            darkSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: `top ${window.innerHeight - border.offsetHeight}`,
                    end: `bottom ${window.innerHeight - border.offsetHeight}`,
                    // markers: true,
                    onEnter: () => {
                        border.classList.add('text-color-seconday');
                    },
                    onLeave: () => {
                        border.classList.remove('text-color-seconday');
                    },
                    onEnterBack: () => {
                        border.classList.add('text-color-seconday');
                    },
                    onLeaveBack: () => {
                        border.classList.remove('text-color-seconday');
                    }
                });
            });
        }


        // Visibility Handler
        const hideWrapper = document.querySelectorAll('.hide-border');
        if (hideWrapper <= 0) {
            return
        }

        hideWrapper.forEach((wrapper) => {
            ScrollTrigger.create({
                trigger: wrapper,
                start: `top ${window.innerHeight - border.offsetHeight}`,
                end: `bottom ${window.innerHeight - border.offsetHeight}`,
                onEnter: () => {
                    border.classList.add('hide-down');
                },
                onLeave: () => {
                    border.classList.remove('hide-down');
                },
                onEnterBack: () => {
                    border.classList.add('hide-down');
                },
                onLeaveBack: () => {
                    border.classList.remove('hide-down');
                }
            });
        });

    } // if border
}