package com.governdata.ehr_emr_be.importer;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Deterministic synthetic demographics from a stable patient UUID + CSV fields.
 * Same patient id always yields the same name and contact info (reproducible demos).
 */
public final class SyntheticDemographics {

    private static final String[] FIRST = {
            "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
            "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
            "Thomas", "Sarah", "Christopher", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
            "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley",
            "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle",
            "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Timothy", "Deborah",
            "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Laura", "Jeffrey", "Helen",
            "Ryan", "Sharon", "Jacob", "Cynthia", "Gary", "Kathleen", "Nicholas", "Amy",
            "Eric", "Shirley", "Jonathan", "Angela", "Stephen", "Anna", "Larry", "Brenda",
            "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma", "Benjamin", "Samantha",
            "Samuel", "Katherine", "Frank", "Christine", "Gregory", "Debra", "Raymond", "Rachel",
            "Alexander", "Catherine", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Maria"
    };

    private static final String[] LAST = {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
            "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
            "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
            "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
            "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
            "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
            "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
            "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
            "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
            "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
            "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
            "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
            "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell",
            "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher",
            "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham",
            "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole", "Hayes", "Bryant"
    };

    private static final String[] STREETS = {
            "Oak Ave", "Maple Dr", "Cedar Ln", "Pine St", "Elm Rd", "Birch Way", "Willow Ct",
            "Lake View Dr", "River Rd", "Highland Ave", "Park Blvd", "Sunset Blvd", "Mill St",
            "Church St", "School St", "Main St", "Washington Ave", "Lincoln Rd", "Franklin St"
    };

    private SyntheticDemographics() {}

    public static String mrnFor(UUID patientId) {
        return "SYN-" + patientId.toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    public static String firstName(UUID patientId) {
        return FIRST[index(patientId, FIRST.length)];
    }

    public static String lastName(UUID patientId) {
        return LAST[index(patientId, LAST.length)];
    }

    public static LocalDate dateOfBirth(UUID patientId, int ageYears, LocalDate asOfVisitDate) {
        int y = Math.max(1900, asOfVisitDate.getYear() - ageYears);
        int month = 1 + index(patientId, 12);
        int day = 1 + index(rotate(patientId), 28);
        LocalDate d = LocalDate.of(y, month, day);
        if (d.isAfter(asOfVisitDate)) {
            d = asOfVisitDate.minusYears(ageYears);
        }
        return d;
    }

    public static String normalizedGender(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String g = raw.trim();
        if (g.equalsIgnoreCase("Female")) {
            return "F";
        }
        if (g.equalsIgnoreCase("Male")) {
            return "M";
        }
        return g;
    }

    public static String streetAddress(UUID patientId) {
        int num = 100 + index(rotate(patientId), 8900);
        String st = STREETS[index(rotate(patientId), STREETS.length)];
        return num + " " + st;
    }

    public static String cityStateZip(UUID patientId) {
        String[] cities = {"Springfield, IL 62701", "Madison, WI 53703", "Columbus, OH 43215",
                "Austin, TX 78701", "Denver, CO 80202", "Portland, OR 97201", "Tampa, FL 33602"};
        return cities[index(patientId, cities.length)];
    }

    public static String phone(UUID patientId) {
        int mid = 100 + index(patientId, 900);
        int last = index(rotate(patientId), 10000);
        return String.format("+1-555-%03d-%04d", mid, last);
    }

    public static String email(String firstName, String lastName, UUID patientId) {
        String local = (firstName + "." + lastName).toLowerCase().replaceAll("[^a-z]", "")
                + "." + patientId.toString().substring(0, 8);
        return local + "@synthetic.demo.local";
    }

    public static OffsetDateTime encounterDateAtNoonUtc(LocalDate visitDate) {
        return OffsetDateTime.of(visitDate, LocalTime.NOON, ZoneOffset.UTC);
    }

    private static UUID rotate(UUID id) {
        long msb = id.getMostSignificantBits();
        long lsb = id.getLeastSignificantBits();
        return new UUID(lsb, msb);
    }

    private static int index(UUID id, int bound) {
        long x = id.getMostSignificantBits() ^ id.getLeastSignificantBits();
        return (int) (Math.floorMod(x, bound));
    }
}
