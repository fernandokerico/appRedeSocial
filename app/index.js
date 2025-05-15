import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Controle de Gastos!</Text>

      {/* Subtítulo explicativo */}
      <Text style={styles.subtitle}>
        Para acessar seu controle de gastos, faça o login primeiro.
      </Text>

      {/* Link para a página de login */}
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ir para Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f7f7f7", 
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333", 
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#555", 
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  button: {
    backgroundColor: "#4CAF50", 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
