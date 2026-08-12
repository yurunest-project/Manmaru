import Foundation

struct Destination: Identifiable, Codable, Hashable {
    var id: String
    var name: String
    var address: String
    var latitude: Double
    var longitude: Double

    init(
        id: String = UUID().uuidString,
        name: String,
        address: String,
        latitude: Double,
        longitude: Double
    ) {
        self.id = id
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
    }
}
