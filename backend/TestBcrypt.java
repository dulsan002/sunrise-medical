import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        boolean matches = encoder.matches("Admin@123", "$2a$12$dE7rY6D75p30h5V3P41F1uzxSgC3Yd5eP2L71a7y88D3nU4q3m7pG");
        System.out.println("Matches: " + matches);
    }
}
