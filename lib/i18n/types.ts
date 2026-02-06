export type ItineraryAdminMessages = {
    itinerary: {
        title: string;
        daySwitch: {
            prev: string;
            next: string;
            label: string;
            addDay: string;
        };
        labels: {
            timeline: string;
            dayList: string;
            dragDay: string;
            back: string;
            editor: string;
            timeStart: string;
            timeEnd: string;
            title: string;
            location: string;
            parking: string;
            contact: string;
            memo: string;
            saveTrip: string;
            savingTrip: string;
            addItem: string;
            deleteItem: string;
            editTrip: string;
            deleteTrip: string;
            emptySelection: string;
            emptyDay: string;
            emptyTitle: string;
            emptyBody: string;
            addDay: string;
            departureTitle: string;
            weekdays: string[];
        };
        tripModal: {
            title: string;
            nameLabel: string;
            slugLabel: string;
            cancel: string;
            save: string;
            saving: string;
        };
        tripDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        unsavedModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
        };
        dayModal: {
            title: string;
            dateLabel: string;
            cancel: string;
            create: string;
            creating: string;
        };
        dayEditModal: {
            title: string;
            dateLabel: string;
            cancel: string;
            save: string;
        };
        itemDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        dayDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        validation: {
            required: string;
            invalidUrl: string;
            endBeforeStart: string;
            timeInvalid: string;
            tooLong: string;
            dateDuplicate: string;
            dateInvalid: string;
            saveFailed: string;
            slugDuplicate: string;
        };
    };
};
