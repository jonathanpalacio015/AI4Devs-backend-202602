const NAME_REGEX = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LOCAL_PHONE_REGEX = /^(6|7|9)\d{8}$/;
const INTERNATIONAL_PHONE_REGEX = /^\d{10,15}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

//Length validations according to the database schema

const validateName = (name: string) => {
    if (!name || name.length < 2 || name.length > 100 || !NAME_REGEX.test(name)) {
        throw new Error('Invalid name');
    }
};

const validateEmail = (email: string) => {
    if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error('Invalid email');
    }
};

const normalizePhone = (phone: string): string => {
    let sanitizedPhone = phone.trim().replace(/[\s\-()]/g, '');

    if (sanitizedPhone.startsWith('+')) {
        sanitizedPhone = sanitizedPhone.slice(1);
    }

    if (sanitizedPhone.startsWith('00')) {
        sanitizedPhone = sanitizedPhone.slice(2);
    }

    if (sanitizedPhone.startsWith('34') && sanitizedPhone.length === 11) {
        const withoutSpainPrefix = sanitizedPhone.slice(2);
        if (LOCAL_PHONE_REGEX.test(withoutSpainPrefix)) {
            sanitizedPhone = withoutSpainPrefix;
        }
    }

    return sanitizedPhone;
};

const validatePhone = (phone: unknown): string | undefined => {
    if (phone === undefined || phone === null || phone === '') {
        return undefined;
    }

    if (typeof phone !== 'string') {
        throw new Error('Invalid phone');
    }

    const normalizedPhone = normalizePhone(phone);

    const isValidLocalPhone = LOCAL_PHONE_REGEX.test(normalizedPhone);
    const isValidInternationalPhone = INTERNATIONAL_PHONE_REGEX.test(normalizedPhone);

    if (!isValidLocalPhone && !isValidInternationalPhone) {
        throw new Error('Invalid phone');
    }

    return normalizedPhone;
};

const validateDate = (date: string) => {
    if (!date || !DATE_REGEX.test(date)) {
        throw new Error('Invalid date');
    }
};

const validateAddress = (address: string) => {
    if (address && address.length > 100) {
        throw new Error('Invalid address');
    }
};

const validateEducation = (education: any) => {
    if (!education.institution || education.institution.length > 100) {
        throw new Error('Invalid institution');
    }

    if (!education.title || education.title.length > 100) {
        throw new Error('Invalid title');
    }

    validateDate(education.startDate);

    if (education.endDate && !DATE_REGEX.test(education.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateExperience = (experience: any) => {
    if (!experience.company || experience.company.length > 100) {
        throw new Error('Invalid company');
    }

    if (!experience.position || experience.position.length > 100) {
        throw new Error('Invalid position');
    }

    if (experience.description && experience.description.length > 200) {
        throw new Error('Invalid description');
    }

    validateDate(experience.startDate);

    if (experience.endDate && !DATE_REGEX.test(experience.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateCV = (cv: any) => {
    if (typeof cv !== 'object' || !cv.filePath || typeof cv.filePath !== 'string' || !cv.fileType || typeof cv.fileType !== 'string') {
        throw new Error('Invalid CV data');
    }
};

export const validateCandidateData = (data: any) => {
    if (data.id) {
        // If id is provided, we are editing an existing candidate, so fields are not mandatory
        return;
    }

    validateName(data.firstName); 
    validateName(data.lastName); 
    validateEmail(data.email);
    data.phone = validatePhone(data.phone);
    validateAddress(data.address);

    if (data.educations) {
        for (const education of data.educations) {
            validateEducation(education);
        }
    }

    if (data.workExperiences) {
        for (const experience of data.workExperiences) {
            validateExperience(experience);
        }
    }

    if (data.cv && Object.keys(data.cv).length > 0) {
        validateCV(data.cv);
    }
};